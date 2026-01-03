"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileSidebar } from "./MobileSidebar"
import { ThemeToggle } from "./ThemeToggle"
import { Tooltip } from "@/components/ui/tooltip"

interface HeaderProps {
    slug: string
    userProfile?: {
        name: string
        role: string
    }
    camaraNome?: string
}

export function Header({ slug, userProfile, camaraNome }: HeaderProps) {
  return (
    <div className="flex items-center h-14 px-6 justify-between md:justify-end bg-transparent z-50 border-t border-b border-border/90">
        <MobileSidebar slug={slug} userProfile={userProfile} />
        
        <div className="flex items-center gap-x-4">
             {camaraNome && (
               <span className="hidden sm:inline-flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                 {camaraNome}
               </span>
             )}
             
             <div className="flex items-center gap-x-2">
                <ThemeToggle />
                <Tooltip content="Notificações">
                  <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                       <Bell className="h-4 w-4" />
                  </Button>
                </Tooltip>
             </div>
        </div>
    </div>
  )
}
