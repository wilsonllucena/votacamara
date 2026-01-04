"use client"

import { useState, useTransition, useEffect } from "react"
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
  Activity,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { createSituacao, updateSituacao, deleteSituacao } from "@/app/admin/_actions/situacoes"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Pagination } from "@/components/admin/Pagination"
import { useSearchParams } from "next/navigation"

const situacaoSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  label: z.string().min(2, "O label deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional().or(z.literal("")),
})

type SituacaoInputs = z.infer<typeof situacaoSchema>

interface Situacao {
  id: string
  nome: string
  label: string
  descricao: string | null
  created_at: string
}

interface SituacoesClientProps {
  slug: string
  situacoes: Situacao[]
  pagination: {
    currentPage: number
    totalPages: number
  }
}

export function SituacoesClient({ slug, situacoes, pagination }: SituacoesClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")

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
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Situações de Matérias</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Estados de tramitação configurados globalmente no sistema.
          </p>
        </div>
      </div>

      <div className="p-4 border border-dashed border-border rounded-lg bg-muted/20 text-xs text-muted-foreground">
          <p>⚠️ <strong>Nota:</strong> As situações de tramitação são gerenciadas globalmente. Esta página é apenas para consulta.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por nome ou label..."
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
                <th className="px-6 py-4 font-bold tracking-wider">Situação (Exibição)</th>
                <th className="px-6 py-4 font-bold tracking-wider">Label (Sistema)</th>
                <th className="px-6 py-4 font-bold tracking-wider hidden md:table-cell">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {situacoes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground italic">
                    Nenhuma situação encontrada.
                  </td>
                </tr>
              ) : (
                situacoes.map((sit) => (
                  <tr key={sit.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-4 sm:px-6 py-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                         <CheckCircle2 className="w-4 h-4 text-green-500/60 shrink-0" />
                         <span className="truncate max-w-[120px] sm:max-w-none">{sit.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                       <span className="px-2 py-0.5 font-mono text-[10px] sm:text-xs text-primary bg-primary/5 rounded-md border border-primary/10">
                          {sit.label}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell max-w-xs truncate text-[10px] uppercase font-bold tracking-widest">
                      {sit.descricao || "Sem descrição"}
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
