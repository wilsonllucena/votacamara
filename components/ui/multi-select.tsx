"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown, Search, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface Option {
  id: string
  nome: string
  partido?: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

export function MultiSelect({ options, selected, onChange, placeholder = "Selecionar..." }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selectedOptions = options.filter((opt) => selected.includes(opt.id))
  
  const filteredOptions = options.filter((opt) => 
    opt.nome.toLowerCase().includes(query.toLowerCase()) || 
    (opt.partido && opt.partido.toLowerCase().includes(query.toLowerCase()))
  )

  const handleToggle = (id: string) => {
    const newSelected = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id]
    onChange(newSelected)
  }

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={cn(
          "flex min-h-[44px] w-full flex-wrap items-center justify-between gap-1 rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-primary/50 cursor-pointer transition-all",
          open && "border-primary/50 ring-2 ring-primary/50"
        )}
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap gap-1">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <Badge
                key={opt.id}
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 pl-1 py-0.5 gap-1"
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggle(opt.id)
                }}
              >
                <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="h-2.5 w-2.5" />
                </div>
                {opt.nome}
                <X className="h-3 w-3 hover:text-red-500 transition-colors" />
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in zoom-in-95 bg-card">
          <div className="flex items-center border-b border-border px-3 h-10 sticky top-0 bg-card z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-full w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Buscar parlamentar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-[180px] p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = selected.includes(opt.id)
                return (
                  <div
                    key={opt.id}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-muted transition-colors",
                      isSelected && "bg-primary/5 text-primary font-medium"
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggle(opt.id)
                    }}
                  >
                    <div className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-all",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                    )}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span>{opt.nome}</span>
                    {opt.partido && (
                      <span className="ml-auto text-[10px] text-muted-foreground font-normal uppercase">{opt.partido}</span>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Nenhum parlamentar encontrado.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
