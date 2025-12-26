"use client"

import { create } from "zustand"
import { createClient } from "@/utils/supabase/client"
import { RealtimeChannel } from "@supabase/supabase-js"

interface SessionState {
    votes: any[]
    activeVoting: any | null
    sessaoStatus: string
    channels: RealtimeChannel[]
    currentSessaoId: string | null
    currentCamaraId: string | null
    initialize: (sessaoId: string, camaraId: string, initialData?: { votes?: any[], activeVoting?: any, sessaoStatus?: string }, onUpdate?: () => void) => void
    setVotes: (votes: any[]) => void
    setActiveVoting: (activeVoting: any) => void
    setSessaoStatus: (status: string) => void
    cleanup: () => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
    votes: [],
    activeVoting: null,
    sessaoStatus: "agendada",
    channels: [],

    currentSessaoId: null as string | null,
    currentCamaraId: null as string | null,

    setVotes: (votes) => set({ votes }),
    setActiveVoting: (activeVoting) => set({ activeVoting }),
    setSessaoStatus: (sessaoStatus) => set({ sessaoStatus }),

    initialize: (sessaoId, camaraId, initialData, onUpdate?: () => void) => {
        const state = get()
        
        // Avoid redundant re-initialization if IDs are the same
        if (state.currentSessaoId === sessaoId && state.currentCamaraId === camaraId && state.channels.length > 0) {
            return
        }

        state.cleanup()
        set({ currentSessaoId: sessaoId, currentCamaraId: camaraId })

        if (initialData) {
            set({
                votes: initialData.votes || [],
                activeVoting: initialData.activeVoting || null,
                sessaoStatus: initialData.sessaoStatus || "agendada"
            })

            // If we have an initial active voting, fetch its votes
            if (initialData.activeVoting) {
                const supabase = createClient()
                supabase.from("votos")
                    .select("*")
                    .eq("votacao_id", initialData.activeVoting.id)
                    .then(({ data }) => {
                        if (data) set({ votes: data })
                    })
            }
        }

        const supabase = createClient()

        // 1. Channel for Votes (Chamber-wide)
        const votesChannel = supabase
            .channel(`chamber-votes-${camaraId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'votos',
                filter: `camara_id=eq.${camaraId}`
            }, (payload) => {
                const newVote = payload.new as any
                const currentActive = get().activeVoting
                if (currentActive && newVote.votacao_id === currentActive.id) {
                    set((state) => {
                        const exists = state.votes.some(v => v.id === newVote.id)
                        if (exists) return state
                        return { votes: [...state.votes, newVote] }
                    })
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'votos',
                filter: `camara_id=eq.${camaraId}`
            }, (payload) => {
                const updatedVote = payload.new as any
                set((state) => ({
                    votes: state.votes.map(v => v.id === updatedVote.id ? updatedVote : v)
                }))
            })
            .subscribe()

        // 2. Channel for Voting Status (Chamber-wide)
        const votingChannel = supabase
            .channel(`chamber-voting-${camaraId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'votacoes',
                filter: `camara_id=eq.${camaraId}`
            }, (payload) => {
                const updated = payload.new as any
                const event = payload.eventType

                if (event === 'DELETE' || (updated && updated.status === 'encerrada')) {
                    const currentActive = get().activeVoting
                    if (currentActive && (event === 'DELETE' || updated.id === currentActive.id)) {
                        set({ activeVoting: null, votes: [] })
                        if (onUpdate) onUpdate()
                    }
                } else if (updated && updated.status === 'aberta') {
                    // Fetch full project details
                    supabase.from("votacoes")
                        .select("*, projetos(*)")
                        .eq("id", updated.id)
                        .single()
                        .then(({ data }) => {
                            if (data) {
                                set({ activeVoting: data, votes: [] })
                                if (onUpdate) onUpdate()
                                // Also fetch existing votes
                                supabase.from("votos")
                                    .select("*")
                                    .eq("votacao_id", data.id)
                                    .then(({ data: vData }) => {
                                        if (vData) set({ votes: vData })
                                    })
                            }
                        })
                }
            })
            .subscribe()

        // 3. Channel for Session Status (Chamber-wide)
        const statusChannel = supabase
            .channel(`chamber-status-${camaraId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'sessoes',
                filter: `camara_id=eq.${camaraId}`
            }, (payload) => {
                const updated = payload.new as any
                if (updated && (updated.id === sessaoId || updated.status === 'aberta')) {
                    set({ sessaoStatus: updated.status })
                    if (onUpdate) onUpdate()
                }
            })
            .subscribe()

        set({ channels: [votesChannel, votingChannel, statusChannel] })
    },

    cleanup: () => {
        const { channels } = get()
        channels.forEach(ch => {
            try {
                ch.unsubscribe()
            } catch (e) {
                console.error("Error unsubscribing:", e)
            }
        })
        set({ votes: [], activeVoting: null, sessaoStatus: "agendada", channels: [], currentSessaoId: null, currentCamaraId: null })
    }
}))
