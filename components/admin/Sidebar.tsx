"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Briefcase,
  Table,
  LucideIcon
} from "lucide-react"
import { signOutAction } from "@/app/(auth)/_actions"
import { useSidebar } from "./SidebarProvider"
import { createMongoAbility, RawRuleOf, MongoAbility } from "@casl/ability"
import { Action, Subject } from "@/lib/casl/ability"

interface SidebarProps {
  slug: string
  camaraNome?: string
  userProfile?: {
      name: string
      role: string
  }
  rules?: RawRuleOf<MongoAbility<[Action, Subject]>>[]
}

interface SidebarSubItem {
    label: string
    href: string
    active: boolean
    canView?: boolean
}

interface SidebarItem {
    label: string
    icon: LucideIcon
    href: string
    active: boolean
    canView?: boolean
    subItems?: SidebarSubItem[]
}

interface SidebarGroup {
    title: string
    items: SidebarItem[]
}

export function Sidebar({ slug, camaraNome, rules = [] }: SidebarProps) {
  const pathname = usePathname()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  // Reconstruir habilidade no cliente de forma estável
  const ability = useMemo(() => createMongoAbility<[Action, Subject]>(rules), [rules])
  const can = useCallback((action: Action, subject: Subject) => ability.can(action, subject), [ability])

  const groups: SidebarGroup[] = useMemo(() => [
    {
      title: "",
      items: [
        {
          label: "Cockpit",
          icon: LayoutDashboard,
          href: `/admin/${slug}/dashboard`,
          active: pathname === `/admin/${slug}/dashboard`,
        }
      ]
    },
    {
      title: "LEGISLATIVO",
      items: [
        {
          label: "Matérias",
          icon: FileText,
          href: '',
          active: pathname.startsWith(`/admin/${slug}/projetos`),
          subItems: [
            {
              label: "Listar Matérias",
              href: `/admin/${slug}/projetos`,
              active: pathname === `/admin/${slug}/projetos`,
            },
            {
              label: "Categorias",
              href: `/admin/${slug}/projetos/categorias`,
              active: pathname === `/admin/${slug}/projetos/categorias`,
              canView: can('configurar', 'Materia'),
            },
            {
              label: "Situação",
              href: `/admin/${slug}/projetos/situacoes`,
              active: pathname === `/admin/${slug}/projetos/situacoes`,
              canView: can('configurar', 'Materia'),
            },
            {
              label: "Tipos de Matéria",
              href: `/admin/${slug}/projetos/tipos`,
              active: pathname === `/admin/${slug}/projetos/tipos`,
              canView: can('configurar', 'Materia'),
            }
          ].filter(item => item.canView !== false)
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
                label: "Lista de Presença",
                href: `/admin/${slug}/sessoes/presencas`,
                active: pathname === `/admin/${slug}/sessoes/presencas`,
                canView: can('manage', 'Sessao'),
            },
            {
                label: "Relatórios",
                href: `/admin/${slug}/sessoes/relatorios`,
                active: pathname === `/admin/${slug}/sessoes/relatorios`,
                canView: can('manage', 'Sessao'),
            }
          ].filter(item => item.canView !== false)
        }
      ]
    },
    {
      title: "ADMINISTRAÇÃO",
      items: [
        {
          label: "Vereadores",
          icon: Users,
          href: `/admin/${slug}/vereadores`,
          active: pathname.startsWith(`/admin/${slug}/vereadores`),
          canView: (can('manage', 'Vereador') || can('read', 'Vereador')),
        },
        {
          label: "Votações",
          icon: Vote,
          href: `/admin/${slug}/votar`,
          active: pathname.startsWith(`/admin/${slug}/votar`),
          canView: can('votar', 'Sessao'),
        },
        {
          label: "Configurações",
          icon: Settings,
          href: `/admin/${slug}/configuracoes`,
          active: pathname.startsWith(`/admin/${slug}/configuracoes`),
        },
        {
            label: "Cargos",
            icon: Briefcase,
            href: `/admin/${slug}/cargos`,
            active: pathname.startsWith(`/admin/${slug}/cargos`),
            canView: can('configurar', 'all'),
        },
        {
            label: "Mesa Diretora",
            icon: Table,
            href: `/admin/${slug}/mesa-diretora`,
            active: pathname.startsWith(`/admin/${slug}/mesa-diretora`),
            canView: can('manage', 'MesaDiretora'),
        },
      ].filter(item => item.canView !== false)
    }
  ], [slug, pathname, can])

  useEffect(() => {
    const allRoutes = groups.flatMap(g => g.items)
    const activeParents = allRoutes
      .filter(r => r.active && r.subItems)
      .map(r => r.label)
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setExpandedMenus((prev: string[]) => {
        const newExpanded = [...prev]
        let changed = false
        activeParents.forEach(p => {
            if (!newExpanded.includes(p)) {
                newExpanded.push(p)
                changed = true
            }
        })
        return changed ? newExpanded : prev
    })
  }, [groups]) // groups depends on pathname, so this is sufficient

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev: string[]) => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#1e293b] text-slate-300">
      <div className={cn(
        "h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 transition-all duration-300 relative z-20 bg-[#1e293b]",
        isCollapsed && "justify-center px-2"
      )}>
        <div className="flex items-center gap-2 overflow-hidden underline-none decoration-transparent">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-[16px] font-bold text-white shrink-0 shadow-sm">
                🏛️
            </div>
            {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-white tracking-tight leading-none">CÂMARA MUNICIPAL</span>
                    <span className="text-[10px] font-medium text-slate-400 leading-none truncate">{camaraNome ? `${camaraNome}` : "Câmara"}</span>
                </div>
            )}
        </div>
        
        {!isCollapsed && (
            <button 
              onClick={toggleSidebar}
              className="p-1.5 hover:bg-slate-800 rounded-md transition-all text-slate-400 hover:text-white"
              title="Recolher menu"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
        )}
      </div>
      
      {/* Sidebar Content (Border Right) */}
      <div className="flex-1 flex flex-col min-h-0 border-r border-slate-800 overflow-hidden">
          {/* Mobile/Collapsed Toggle (Centered if collapsed) */}
          {isCollapsed && (
              <div className="flex justify-center py-2 border-b border-slate-800/50">
                <button 
                      onClick={toggleSidebar}
                      className="p-1.5 hover:bg-slate-800 rounded-md transition-all text-slate-400 hover:text-white"
                      title="Expandir menu"
                    >
                      <Menu className="w-4 h-4" />
                </button>
              </div>
          )}

          {/* Navigation */}
          <div className="flex-1 px-3 py-2 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {groups.map((group, index) => (
                <div key={index} className="space-y-1">
                    {group.title && !isCollapsed && (
                        <h3 className="px-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
                            {group.title}
                        </h3>
                    )}
                    {group.items.map((route) => {
                        const isExpanded = expandedMenus.includes(route.label)
                        const hasSubItems = route.subItems && route.subItems.length > 0

                        return (
                            <div key={route.label} className="space-y-1">
                                {hasSubItems ? (
                                <div
                                    onClick={() => !isCollapsed && toggleMenu(route.label)}
                                    className={cn(
                                    "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer group",
                                    route.active 
                                        ? "text-orange-600 bg-orange-500/20" 
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50",
                                    isCollapsed && "justify-center px-0 py-2 h-10 w-10 mx-auto gap-0"
                                    )}
                                >
                                    <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                                        <route.icon className={cn("w-5 h-5", !isCollapsed && "shrink-0")} />
                                        {!isCollapsed && <span className="truncate">{route.label}</span>}
                                    </div>
                                    {!isCollapsed && (
                                        <ChevronRight className={cn(
                                            "w-3.5 h-3.5 transition-transform duration-300 text-slate-500 group-hover:text-slate-300",
                                            isExpanded ? "rotate-90" : "rotate-0"
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
                                        ? "text-orange-600 bg-orange-500/20 border-l-2 border-orange-500" 
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50 border-l-2 border-transparent",
                                    isCollapsed && "justify-center px-0 py-2 h-10 w-10 mx-auto gap-0 border-l-0"
                                    )}
                                >
                                    <route.icon className={cn("w-5 h-5", !isCollapsed && "shrink-0")} />
                                    {!isCollapsed && <span className="truncate">{route.label}</span>}
                                </Link>
                                )}
                            
                            {!isCollapsed && hasSubItems && isExpanded && (
                                <div className="ml-4 pl-3 border-l border-slate-700/50 flex flex-col gap-1 pt-1 pb-1">
                                    {route.subItems!.map((subItem) => (
                                        <Link
                                            key={subItem.label}
                                            href={subItem.href}
                                            className={cn(
                                                "text-xs py-1.5 px-3 rounded-md transition-colors block",
                                                subItem.active
                                                    ? "text-white bg-slate-800 font-medium"
                                                    : "text-slate-400 hover:text-white hover:bg-slate-800/30"
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
        ))}
      </div>

      {/* Logout */}
      <div className={cn("p-4 border-t border-slate-800", isCollapsed && "p-2")}>
         <form action={signOutAction} className="w-full">
            <button 
                type="submit"
                className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-md transition-colors",
                    isCollapsed && "justify-center px-0 h-10 w-10"
                )}
                title="Encerrar Sessão"
            >
                <LogOut className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>→ Encerrar Sessão</span>}
            </button>
         </form>
      </div>
      </div>
    </div>
  )
}
