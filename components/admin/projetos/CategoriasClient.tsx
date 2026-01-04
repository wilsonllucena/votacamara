"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus, 
  List, 
  Edit2, 
  Trash2, 
  Search,
  Tag,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { createCategoria, updateCategoria, deleteCategoria } from "@/app/admin/_actions/categorias"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Pagination } from "@/components/admin/Pagination"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

const categoriaSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional().or(z.literal("")),
})

type CategoriaInputs = z.infer<typeof categoriaSchema>

import { createMongoAbility, RawRuleOf, MongoAbility } from "@casl/ability"
import { Action, Subject } from "@/lib/casl/ability"
import { useMemo } from "react"

interface Categoria {
  id: string
  nome: string
  descricao: string | null
  created_at: string
}

interface CategoriasClientProps {
  slug: string
  categorias: Categoria[]
  pagination: {
    currentPage: number
    totalPages: number
  }
  rules?: RawRuleOf<MongoAbility<[Action, Subject]>>[]
}

export function CategoriasClient({ slug, categorias, pagination, rules = [] }: CategoriasClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")

  // Reconstruir abilidade no cliente de forma estável
  const ability = useMemo(() => createMongoAbility<[Action, Subject]>(rules), [rules])
  const can = (action: Action, subject: Subject) => ability.can(action, subject)

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm) {
      params.set("search", searchTerm)
    } else {
      params.delete("search")
    }
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Categorias</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Temas e classificações globais para as matérias legislativas.
          </p>
        </div>
      </div>
      <div className="p-4 border border-dashed border-border rounded-lg bg-muted/20 text-xs text-muted-foreground">
          <p>⚠️ <strong>Nota:</strong> As categorias são gerenciadas globalmente. Esta página é apenas para consulta.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por nome..."
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
          />
        </div>
        <Button onClick={handleSearch} variant="secondary" className="md:w-32">
            Buscar
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Nome</th>
                <th className="px-6 py-4 font-bold tracking-wider hidden md:table-cell">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categorias.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-muted-foreground italic">
                    Nenhuma categoria encontrada.
                  </td>
                </tr>
              ) : (
                categorias.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-4 sm:px-6 py-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                         <Tag className="w-4 h-4 text-primary/60 shrink-0" />
                         <span className="truncate max-w-[150px] sm:max-w-none">{cat.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell max-w-xs truncate text-[10px] uppercase font-bold tracking-widest">
                      {cat.descricao || "Sem descrição"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination 
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
      />
    </div>
  )
}
