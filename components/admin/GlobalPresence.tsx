"use client"

import { useEffect } from "react"
import { usePresenceStore } from "@/store/use-presence-store"

interface GlobalPresenceProps {
    userId: string
    camaraId: string
}

export function GlobalPresence({ userId, camaraId }: GlobalPresenceProps) {
    const { initialize, cleanup } = usePresenceStore()

    useEffect(() => {
        if (!userId || !camaraId) return

        initialize(camaraId, userId)

        return () => {
            cleanup()
        }
    }, [userId, camaraId, initialize, cleanup])

    return null
}
