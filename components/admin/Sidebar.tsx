"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  Gavel,
  Vote,
  Settings,
  ChevronsUpDown,
  LogOut,
  Calendar,
  Menu,
  ChevronLeft,
  Briefcase
} from "lucide-react"
import { signOutAction } from "@/app/(auth)/_actions"
import { useSidebar } from "./SidebarProvider"

interface SidebarProps {
  slug: string
  userProfile?: {
      name: string
      role: string
  }
}

export function Sidebar({ slug, userProfile }: SidebarProps) {
  const pathname = usePathname()
  const { isCollapsed, toggleSidebar } = useSidebar()

  const routes = [
    {
      label: "Visão Geral",
      icon: LayoutDashboard,
      href: `/admin/${slug}/dashboard`,
      active: pathname === `/admin/${slug}/dashboard`,
    },
    {
      label: "Sessões",
      icon: Gavel,
      href: `/admin/${slug}/sessoes`,
      active: pathname.startsWith(`/admin/${slug}/sessoes`),
    },
    // {
    //   label: "Agenda",
    //   icon: Calendar,
    //   href: `/admin/${slug}/agenda`,
    //   active: pathname.startsWith(`/admin/${slug}/agenda`),
    // },
    {
      label: "Materias",
      icon: FileText,
      href: `/admin/${slug}/projetos`,
      active: pathname.startsWith(`/admin/${slug}/projetos`),
    },
    {
      label: "Vereadores",
      icon: Users,
      href: `/admin/${slug}/vereadores`,
      active: pathname.startsWith(`/admin/${slug}/vereadores`),
    },
    {
      label: "Cargos",
      icon: Briefcase,
      href: `/admin/${slug}/cargos`,
      active: pathname.startsWith(`/admin/${slug}/cargos`),
    },
    {
      label: "Votação",
      icon: Vote,
      href: `/admin/${slug}/votar`,
      active: pathname.startsWith(`/admin/${slug}/votar`),
    },
    {
      label: "Mesa Diretora",
      icon: Gavel,
      href: `/admin/${slug}/mesa-diretora`,
      active: pathname.startsWith(`/admin/${slug}/mesa-diretora`),
    },
    // {
    //   label: "Configurações",
    //   icon: Settings,
    //   href: `/admin/${slug}/configuracoes`,
    //   active: pathname.startsWith(`/admin/${slug}/configuracoes`),
    // },
  ]

  const getInitials = (name: string) => {
      return name
          .split(' ')
          .map(n => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
  }

  return (
    <div className="flex flex-col h-full bg-card text-muted-foreground">
      {/* Brand / Switcher Area */}
      <div className={cn("p-4", isCollapsed && "p-2 shrink-0")}>
        <div className={cn(
            "flex items-center justify-between gap-x-2 px-1 py-1.5 transition-colors rounded-md",
            isCollapsed && "flex-col gap-y-4"
        )}>
            <div className="flex items-center gap-2 overflow-hidden underline-none decoration-transparent">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-[14px] font-bold text-white shrink-0 shadow-sm shadow-indigo-500/20">
                    V
                </div>
                {!isCollapsed && <span className="text-sm font-bold text-foreground truncate tracking-tight">Vota Câmara</span>}
            </div>
            
            <button 
              onClick={toggleSidebar}
              className={cn(
                "p-1.5 hover:bg-accent rounded-md transition-all text-muted-foreground hover:text-foreground border border-border/50 shadow-sm bg-card/80 backdrop-blur-sm",
                isCollapsed && "mt-0"
              )}
              title={isCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              {isCollapsed ? <Menu className="w-3.5 h-3.5" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 py-2 space-y-0.5">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            title={isCollapsed ? route.label : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route.active 
                ? "text-foreground bg-accent" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              isCollapsed && "justify-center px-0 py-2 h-10 w-10 mx-auto gap-0"
            )}
          >
            <route.icon className={cn("w-4 h-4", !isCollapsed && "shrink-0")} />
            {!isCollapsed && <span className="truncate">{route.label}</span>}
          </Link>
        ))}
      </div>

      {/* User Profile */}
      <div className={cn("p-4 border-t border-border", isCollapsed && "p-2")}>
         <div className={cn(
             "flex items-center gap-3 px-2 py-2 hover:bg-accent rounded-md cursor-pointer transition-colors group",
             isCollapsed && "flex-col gap-2 p-0 py-2"
         )}>
             <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white border border-indigo-500/20 transition-all shrink-0 shadow-sm">
                 {userProfile ? getInitials(userProfile.name) : 'U'}
             </div>
             {!isCollapsed && (
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                        {userProfile?.name || 'Carregando...'}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate">
                        {userProfile?.role || 'Membro'}
                    </p>
                </div>
             )}
             <form action={signOutAction} className={cn(isCollapsed && "w-full flex justify-center")}>
                <button 
                    type="submit"
                    className={cn(
                        "p-1.5 hover:bg-red-500/10 rounded-md transition-colors text-muted-foreground hover:text-red-500",
                        isCollapsed && "w-8 h-8 flex items-center justify-center"
                    )}
                    title="Sair"
                >
                    <LogOut className="w-4 h-4" />
                </button>
             </form>
         </div>
      </div>
    </div>
  )
}
