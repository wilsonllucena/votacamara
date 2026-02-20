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
    <div className="h-full relative bg-background">
      <aside 
        className={cn(
          "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-80 bg-card transition-all duration-300 ease-in-out",
          isCollapsed ? "md:w-16" : "md:w-64"
        )}
      >
        {sidebar}
      </aside>
      <main 
        className={cn(
          "h-full transition-all duration-300 ease-in-out relative flex flex-col",
          isCollapsed ? "pl-16" : "pl-64"
        )}
      >
        {header}
        <div className="flex-1 px-4 md:px-8 pb-8 pt-20 bg-slate-50/5 h-full overflow-y-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
