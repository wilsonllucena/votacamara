"use client"

import { ReactNode } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Pagination } from "./Pagination"

interface ResourceListProps {
  title: string
  description: string
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  search?: {
    value: string
    onChange: (val: string) => void
    onSubmit: (e: React.FormEvent) => void
    placeholder?: string
  }
  pagination?: {
    currentPage: number
    totalPages: number
  }
  children: ReactNode
  isEmpty: boolean
  emptyMessage?: string
  emptyIcon?: ReactNode
}

export function ResourceList({
  title,
  description,
  primaryAction,
  search,
  pagination,
  children,
  isEmpty,
  emptyMessage = "Nenhum registro encontrado.",
  emptyIcon
}: ResourceListProps) {
  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {primaryAction && (
          <Button 
            onClick={primaryAction.onClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm w-full sm:w-auto"
          >
            {primaryAction.icon || <Plus className="mr-2 h-4 w-4" />}
            {primaryAction.label}
          </Button>
        )}
      </div>

      {/* Filters */}
      {search && (
        <form onSubmit={search.onSubmit} className="flex items-center gap-4 bg-card/50 p-4 rounded-xl border border-border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={search.placeholder || "Buscar..."} 
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
            />
          </div>
          <Button type="submit" variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-muted hidden sm:flex">
            Buscar
          </Button>
        </form>
      )}

      {/* Content */}
      {isEmpty ? (
        <div className="text-center py-20 bg-card/50 rounded-xl border border-border text-muted-foreground shadow-sm">
          <div className="flex flex-col items-center justify-center gap-3">
             {emptyIcon || <Search className="h-10 w-10 opacity-20" />}
             <p className="font-medium">{emptyMessage}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {children}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pt-4">
          <Pagination 
            totalPages={pagination.totalPages} 
            currentPage={pagination.currentPage} 
          />
        </div>
      )}
    </div>
  )
}
