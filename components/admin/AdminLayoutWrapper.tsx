"use client"

import React from "react"
import { useSidebar } from "./SidebarProvider"
import { cn } from "@/lib/utils"

interface AdminLayoutWrapperProps {
  sidebar: React.ReactNode
  header: React.ReactNode
  children: React.ReactNode
}

export function AdminLayoutWrapper({ sidebar, header, children }: AdminLayoutWrapperProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="min-h-screen flex relative bg-background">
      <aside 
        className={cn(
          "hidden min-h-screen md:flex md:flex-col md:fixed md:inset-y-0 z-80 bg-card transition-all duration-300 ease-in-out",
          isCollapsed ? "md:w-16" : "md:w-64"
        )}
      >
        {sidebar}
      </aside>
      <main 
        className={cn(
          "min-h-screen flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative",
          isCollapsed ? "pl-16" : "pl-64"
        )}
      >
        {header}
        <div className="flex-1 min-h-0 flex flex-col px-4 md:px-8 pt-20 bg-slate-50/5 w-full">
          <div className="flex-1 min-h-0 overflow-y-auto pb-8">
            {children}
          </div>
          <footer className="shrink-0 py-4 md:px-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground bg-background">
            <span>© 2024 VOTA CÂMARA - SISTEMA DE GESTÃO LEGISLATIVA V2.4.0</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors font-medium uppercase tracking-wider">Suporte</a>
              <a href="#" className="hover:text-foreground transition-colors font-medium uppercase tracking-wider">Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors font-medium uppercase tracking-wider">Manual</a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
