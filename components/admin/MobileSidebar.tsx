"use client"

import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "@/components/admin/Sidebar"
import { Button } from "@/components/ui/button"

interface MobileSidebarProps {
    slug: string
    userProfile?: {
        name: string
        role: string
    }
}

export function MobileSidebar({ slug, userProfile }: MobileSidebarProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden pr-4 hover:opacity-75 transition hover:cursor-pointer">
                    <Menu className="text-foreground" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-card border-border w-72">
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <Sidebar slug={slug} userProfile={userProfile} />
            </SheetContent>
        </Sheet>
    )
}
