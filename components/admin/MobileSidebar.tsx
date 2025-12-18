"use client"

import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "@/components/admin/Sidebar"

interface MobileSidebarProps {
    slug: string
    userProfile?: {
        name: string
        role: string
    }
}

export function MobileSidebar({ slug, userProfile }: MobileSidebarProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <div className="md:hidden pr-4 hover:opacity-75 transition hover:cursor-pointer">
                    <Menu className="text-white" />
                </div>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-black border-zinc-900 w-72">
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <Sidebar slug={slug} userProfile={userProfile} />
            </SheetContent>
        </Sheet>
    )
}
