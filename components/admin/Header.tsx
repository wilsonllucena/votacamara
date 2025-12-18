"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <div className="flex items-center p-4 border-b border-slate-800 justify-end bg-slate-950/50 backdrop-blur-sm z-50">
        <div className="flex items-center gap-x-4">
             <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-slate-800">
                 <Bell className="h-5 w-5" />
                 <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
             </Button>
        </div>
    </div>
  )
}
