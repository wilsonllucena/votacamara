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
  Calendar
} from "lucide-react"
import { signOutAction } from "@/app/(auth)/_actions"

interface SidebarProps {
  slug: string
  userProfile?: {
      name: string
      role: string
  }
}

export function Sidebar({ slug, userProfile }: SidebarProps) {
  const pathname = usePathname()

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
    {
      label: "Agenda",
      icon: Calendar,
      href: `/admin/${slug}/agenda`,
      active: pathname.startsWith(`/admin/${slug}/agenda`),
    },
    {
      label: "Pauta & Projetos",
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
      label: "Votação Realtime",
      icon: Vote,
      href: `/admin/${slug}/votar`,
      active: pathname.startsWith(`/admin/${slug}/votar`),
    },
    {
      label: "Votações",
      icon: Vote,
      href: `/admin/${slug}/votacoes`,
      active: pathname.startsWith(`/admin/${slug}/votacoes`),
    },
    {
      label: "Configurações",
      icon: Settings,
      href: `/admin/${slug}/configuracoes`,
      active: pathname.startsWith(`/admin/${slug}/configuracoes`),
    },
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
      <div className="p-4">
        <div className="flex items-center justify-between px-2 py-1.5 transition-colors rounded-md hover:bg-accent cursor-pointer text-foreground">
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                    V
                </div>
                <span className="text-sm font-medium">Vota Câmara</span>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 py-2 space-y-0.5">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route.active 
                ? "text-foreground bg-accent" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <route.icon className="w-4 h-4" />
            {route.label}
          </Link>
        ))}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
         <div className="flex items-center gap-3 px-2 py-2 hover:bg-accent rounded-md cursor-pointer transition-colors group">
             <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground group-hover:text-foreground border border-border">
                 {userProfile ? getInitials(userProfile.name) : 'U'}
             </div>
             <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-foreground truncate">
                    {userProfile?.name || 'Carregando...'}
                 </p>
                 <p className="text-xs text-muted-foreground truncate capitalize">
                    {userProfile?.role?.toLowerCase() || 'Membro'}
                 </p>
             </div>
             <form action={signOutAction}>
                <button 
                    type="submit"
                    className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-red-400"
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
