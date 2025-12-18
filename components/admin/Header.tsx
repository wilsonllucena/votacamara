"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileSidebar } from "./MobileSidebar"

interface HeaderProps {
    slug: string
    userProfile?: {
        name: string
        role: string
    }
}

export function Header({ slug, userProfile }: HeaderProps) {
  return (
    <div className="flex items-center h-14 px-6 justify-between md:justify-end bg-transparent z-50">
        <MobileSidebar slug={slug} userProfile={userProfile} />
        
        <div className="flex items-center gap-x-4">
             <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                 <Bell className="h-4 w-4" />
             </Button>
        </div>
    </div>
  )
}
