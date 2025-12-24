"use client"

import { create } from "zustand"
import { createClient } from "@/utils/supabase/client"
import { RealtimeChannel } from "@supabase/supabase-js"

interface PresenceState {
    onlineUsers: Record<string, any>
    channel: RealtimeChannel | null
    initialize: (camaraId: string, userId: string) => void
    cleanup: () => void
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
    onlineUsers: {},
    channel: null,

    initialize: (camaraId, userId) => {
        const { channel: existingChannel } = get()
        if (existingChannel) return

        const supabase = createClient()
        const presenceChannel = supabase.channel(`presence-${camaraId}`, {
            config: {
                presence: {
                    key: userId,
                },
            },
        })

        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const state = presenceChannel.presenceState()
                console.log('Zustand Presence Sync:', state)
                set({ onlineUsers: { ...state } })
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                console.log('Zustand Presence Join:', key, newPresences)
                set((state) => ({
                    onlineUsers: { ...state.onlineUsers, [key]: newPresences }
                }))
            })
            .on('presence', { event: 'leave' }, ({ key }) => {
                console.log('Zustand Presence Leave:', key)
                set((state) => {
                    const next = { ...state.onlineUsers }
                    delete next[key]
                    return { onlineUsers: next }
                })
            })
            .subscribe(async (status) => {
                console.log('Zustand Presence Status:', status)
                if (status === 'SUBSCRIBED') {
                    // Small delay to ensure tracking
                    setTimeout(async () => {
                        await presenceChannel.track({
                            online_at: new Date().toISOString(),
                            user_id: userId
                        })
                    }, 500)
                }
            })

        set({ channel: presenceChannel })
    },

    cleanup: () => {
        const { channel } = get()
        if (channel) {
            channel.unsubscribe()
            console.log('Zustand Presence: Unsubscribed')
        }
        set({ onlineUsers: {}, channel: null })
    }
}))
