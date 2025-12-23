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
          "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-80 bg-card border-r border-border transition-all duration-300 ease-in-out",
          isCollapsed ? "md:w-16" : "md:w-64"
        )}
      >
        {sidebar}
      </aside>
      <main 
        className={cn(
          "h-full transition-all duration-300 ease-in-out",
          isCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        {header}
        <div className="px-8 pb-8 h-full bg-background min-h-[calc(100vh-56px)]">
          {children}
        </div>
      </main>
    </div>
  )
}
