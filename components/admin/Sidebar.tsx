"use client"

import { useState, useEffect } from "react"
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
  ChevronDown,
  Briefcase,
  Table
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const routes = [
    {
      label: "Visão Geral",
      icon: LayoutDashboard,
      href: `/admin/${slug}/dashboard`,
      active: pathname === `/admin/${slug}/dashboard`,
    },
    {
      label: "Matérias",
      icon: FileText,
      href: `/admin/${slug}/projetos`,
      active: pathname.startsWith(`/admin/${slug}/projetos`),
    },
     {
      label: "Comissões",
      icon: Users,
      href: `/admin/${slug}/comissoes`,
      active: pathname.startsWith(`/admin/${slug}/comissoes`),
      subItems: [
        {
          label: "Listar Comissões",
          href: `/admin/${slug}/comissoes`,
          active: pathname === `/admin/${slug}/comissoes`,
        },
        {
          label: "Atas",
          href: `/admin/${slug}/comissoes/atas`,
          active: pathname === `/admin/${slug}/comissoes/atas`,
        }
      ]
    },
    {
      label: "Sessões Plenárias",
      icon: Gavel,
      href: '',
      active: pathname.startsWith(`/admin/${slug}/sessoes`),
      subItems: [
        {
            label: "Listar Sessões",
            href: `/admin/${slug}/sessoes`,
            active: pathname === `/admin/${slug}/sessoes`,
        },
        {
            label: "Atas",
            href: `/admin/${slug}/sessoes/atas`,
            active: pathname === `/admin/${slug}/sessoes/atas`,
        }
      ]
    },
   {
      label: "Cargos",
      icon: Briefcase,
      href: `/admin/${slug}/cargos`,
      active: pathname.startsWith(`/admin/${slug}/cargos`),
    },
    {
      label: "Mesa Diretora",
      icon: Table,
      href: `/admin/${slug}/mesa-diretora`,
      active: pathname.startsWith(`/admin/${slug}/mesa-diretora`),
    },
    {
      label: "Vereadores",
      icon: Users,
      href: `/admin/${slug}/vereadores`,
      active: pathname.startsWith(`/admin/${slug}/vereadores`),
    },
    {
      label: "Votação",
      icon: Vote,
      href: `/admin/${slug}/votar`,
      active: pathname.startsWith(`/admin/${slug}/votar`),
    },
 
    {
      label: "Configurações",
      icon: Settings,
      href: `/admin/${slug}/configuracoes`,
      active: pathname.startsWith(`/admin/${slug}/configuracoes`),
    },
  ]

  useEffect(() => {
    const activeParents = routes
      .filter(r => r.active && r.subItems)
      .map(r => r.href)
    
    setExpandedMenus((prev: string[]) => {
        const newExpanded = [...prev]
        activeParents.forEach(p => {
            if (!newExpanded.includes(p)) newExpanded.push(p)
        })
        return newExpanded
    })
  }, [pathname])

  const toggleMenu = (href: string) => {
    setExpandedMenus((prev: string[]) => 
      prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href]
    )
  }

  const getInitials = (name: string) => {
      return name
          .split(' ')
          .map(n => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
  }

  return (
    <div className="flex flex-col h-full bg-card text-muted-foreground border-r border-border/50">
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
      <div className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {routes.map((route) => {
          const isExpanded = expandedMenus.includes(route.href)
          
          return (
            <div key={route.href} className="space-y-1">
                {route.subItems ? (
                  <div
                    onClick={() => !isCollapsed && toggleMenu(route.href)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                      route.active 
                        ? "text-foreground bg-accent" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                      isCollapsed && "justify-center px-0 py-2 h-10 w-10 mx-auto gap-0"
                    )}
                  >
                    <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                        <route.icon className={cn("w-4 h-4", !isCollapsed && "shrink-0")} />
                        {!isCollapsed && <span className="truncate">{route.label}</span>}
                    </div>
                    {!isCollapsed && (
                        <ChevronDown className={cn(
                            "w-3.5 h-3.5 transition-transform duration-300",
                            isExpanded ? "rotate-0 text-foreground" : "-rotate-90 text-muted-foreground"
                        )} />
                    )}
                  </div>
                ) : (
                  <Link
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
                )}
                
                {!isCollapsed && route.subItems && isExpanded && (
                    <div className="ml-7 flex flex-col gap-1 border-l border-border pl-3 pb-1 pt-1 animate-in fade-in slide-in-from-top-1 duration-300">
                        {route.subItems.map((subItem) => (
                            <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={cn(
                                    "text-xs py-1.5 px-2 rounded-md transition-colors",
                                    subItem.active
                                        ? "text-foreground bg-accent/40 font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                                )}
                            >
                                {subItem.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
          )
        })}
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
