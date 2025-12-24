"use client"

import { create } from "zustand"
import { createClient } from "@/utils/supabase/client"
import { RealtimeChannel } from "@supabase/supabase-js"

interface SessionState {
    votes: any[]
    activeVoting: any | null
    sessaoStatus: string
    channels: RealtimeChannel[]
    initialize: (sessaoId: string, camaraId: string, initialData?: { votes?: any[], activeVoting?: any, sessaoStatus?: string }) => void
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

    setVotes: (votes) => set({ votes }),
    setActiveVoting: (activeVoting) => set({ activeVoting }),
    setSessaoStatus: (sessaoStatus) => set({ sessaoStatus }),

    initialize: (sessaoId, camaraId, initialData) => {
        const { channels } = get()
        if (channels.length > 0) return

        if (initialData) {
            set({
                votes: initialData.votes || [],
                activeVoting: initialData.activeVoting || null,
                sessaoStatus: initialData.sessaoStatus || "agendada"
            })
        }

        const supabase = createClient()

        // 1. Channel for Votes
        const votesChannel = supabase
            .channel(`session-votes-${sessaoId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'votos',
                filter: `camara_id=eq.${camaraId}` // Ideal is filtering by active voting, but we sync by session/camara
            }, (payload) => {
                const newVote = payload.new
                set((state) => {
                    const exists = state.votes.some(v => v.id === newVote.id)
                    if (exists) return state
                    return { votes: [...state.votes, newVote] }
                })
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'votos',
                filter: `camara_id=eq.${camaraId}`
            }, (payload) => {
                const updatedVote = payload.new
                set((state) => ({
                    votes: state.votes.map(v => v.id === updatedVote.id ? updatedVote : v)
                }))
            })
            .subscribe()

        // 2. Channel for Voting Status (Active Project)
        const votingChannel = supabase
            .channel(`session-voting-${sessaoId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'votacoes',
                filter: `sessao_id=eq.${sessaoId}`
            }, (payload) => {
                const updated = payload.new as any
                if (updated.status === 'encerrada') {
                    set({ activeVoting: null })
                } else if (updated.status === 'aberta') {
                    // Fetch full details if needed or use payload
                    supabase.from("votacoes")
                        .select("*, projetos(*)")
                        .eq("id", updated.id)
                        .single()
                        .then(({ data }) => set({ activeVoting: data }))
                }
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'votacoes',
                filter: `sessao_id=eq.${sessaoId}`
            }, (payload) => {
                const newVoting = payload.new as any
                if (newVoting.status === 'aberta') {
                    supabase.from("votacoes")
                        .select("*, projetos(*)")
                        .eq("id", newVoting.id)
                        .single()
                        .then(({ data }) => set({ activeVoting: data }))
                }
            })
            .subscribe()

        // 3. Channel for Session Status
        const statusChannel = supabase
            .channel(`session-status-${sessaoId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'sessoes',
                filter: `id=eq.${sessaoId}`
            }, (payload) => {
                const updated = payload.new as any
                set({ sessaoStatus: updated.status })
            })
            .subscribe()

        set({ channels: [votesChannel, votingChannel, statusChannel] })
    },

    cleanup: () => {
        const { channels } = get()
        channels.forEach(ch => ch.unsubscribe())
        set({ votes: [], activeVoting: null, sessaoStatus: "agendada", channels: [] })
    }
}))
