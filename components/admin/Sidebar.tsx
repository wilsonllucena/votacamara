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
  MoreHorizontal,
  ChevronsUpDown
} from "lucide-react"

interface SidebarProps {
  slug: string
}

export function Sidebar({ slug }: SidebarProps) {
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

  return (
    <div className="flex flex-col h-full bg-black text-zinc-400">
      {/* Brand / Switcher Area */}
      <div className="p-4">
        <div className="flex items-center justify-between px-2 py-1.5 transition-colors rounded-md hover:bg-zinc-900 cursor-pointer text-zinc-100">
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                    V
                </div>
                <span className="text-sm font-medium">Vota Câmara</span>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-zinc-500" />
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
                ? "text-zinc-100 bg-zinc-900" 
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"
            )}
          >
            <route.icon className="w-4 h-4" />
            {route.label}
          </Link>
        ))}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-zinc-900">
         <div className="flex items-center gap-3 px-2 py-2 hover:bg-zinc-900 rounded-md cursor-pointer transition-colors group">
             <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400 group-hover:text-zinc-100">
                 W
             </div>
             <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-100 truncate">Wilson Lucena</p>
             </div>
             <MoreHorizontal className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
         </div>
      </div>
    </div>
  )
}
