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
  LogOut,
  Landmark
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
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-950 border-r border-slate-800 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href={`/admin/${slug}/dashboard`} className="flex items-center pl-3 mb-14">
           <div className="relative flex items-center justify-center w-8 h-8 mr-4 bg-blue-600/20 rounded-lg border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Landmark className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold">Vota Câmara</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-slate-900 rounded-lg transition",
                route.active ? "text-white bg-slate-900 border border-slate-800 shadow-sm" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.active ? "text-blue-500" : "text-zinc-500 group-hover:text-blue-500")} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-slate-800">
         <div className="flex items-center p-3 rounded-lg bg-slate-900/50 border border-slate-800">
             <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-xs">
                 U
             </div>
             <div className="ml-3 flex-1 overflow-hidden">
                 <p className="text-sm font-medium text-white truncate">Usuário Admin</p>
                 <p className="text-xs text-slate-400 truncate">admin@camara.leg</p>
             </div>
             <LogOut className="h-4 w-4 text-slate-400 hover:text-white cursor-pointer" />
         </div>
      </div>
    </div>
  )
}
