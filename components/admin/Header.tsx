"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileSidebar } from "./MobileSidebar"
import { useSidebar } from "./SidebarProvider"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./ThemeToggle"
import { Tooltip } from "@/components/ui/tooltip"
import { RawRuleOf, MongoAbility } from "@casl/ability"
import { Action, Subject } from "@/lib/casl/ability"

interface HeaderProps {
    slug: string
    userProfile?: {
        name: string
        role: string
    }
    camaraNome?: string
    rules?: RawRuleOf<MongoAbility<[Action, Subject]>>[]
}

export function Header({ slug, userProfile, camaraNome, rules = [] }: HeaderProps) {
  const { isCollapsed } = useSidebar()
  
  const getInitials = (name: string) => {
      return name
          .split(' ')
          .map(n => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
  }

  return (
    <div className={cn(
      "fixed top-0 right-0 z-50 flex items-center h-16 px-6 justify-between bg-[#1e293b] border-b border-slate-800 shadow-sm text-slate-300 transition-all duration-300",
      isCollapsed ? "left-16 w-[calc(100%-4rem)]" : "left-64 w-[calc(100%-16rem)]"
    )}>
        <div className="flex items-center gap-4">
            <MobileSidebar slug={slug} userProfile={userProfile} rules={rules} />
            
            {/* Camera Info */}
            <div className="hidden md:flex flex-col h-8 justify-center">
                <span className="text-sm font-bold text-white tracking-tight leading-none">
                    {camaraNome || "Câmara Municipal"}
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none mt-1">
                    Painel Administrativo
                </span>
            </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                <input 
                    type="text" 
                    placeholder="Buscar no sistema..." 
                    className="w-full h-10 pl-10 pr-4 rounded-full bg-slate-800/50 border border-slate-700/50 focus:border-slate-600 focus:bg-slate-800 focus:ring-1 focus:ring-slate-600 transition-all text-sm outline-none text-slate-200 placeholder:text-slate-500"
                />
            </div>
        </div>
        
        <div className="flex items-center gap-x-3">
             <div className="flex items-center gap-x-1 pr-3 border-r border-slate-800 mr-1">
                <ThemeToggle />
                <Tooltip content="Notificações">
                  <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-slate-800 transition-colors rounded-full">
                       <Bell className="h-5 w-5" />
                       <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-[#1e293b]"></span>
                  </Button>
                </Tooltip>
             </div>

             <div className="flex items-center gap-3 pl-2 py-1 hover:bg-slate-800 rounded-full cursor-pointer transition-colors pr-2 group">
                 <div className="flex flex-col items-end hidden sm:flex">
                     <span className="text-sm font-bold text-white leading-none">{userProfile?.name?.split(' ')[0] || 'Usuário'}</span>
                     <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{userProfile?.role || 'Membro'}</span>
                 </div>
                 <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-slate-800 group-hover:ring-slate-600 transition-all">
                      {userProfile ? getInitials(userProfile.name) : 'U'}
                 </div>
             </div>
        </div>
    </div>
  )
}
