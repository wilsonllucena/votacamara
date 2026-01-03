"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle2, 
  Search 
} from "lucide-react"
import { GenerateAtasDialog } from "./GenerateAtasDialog"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/admin/Pagination"

interface Ata {
  id: string
  nome: string
  data: string
  arquivo_url: string | null
}

interface AtasClientProps {
  slug: string
  initialAtas: Ata[]
  pagination: {
    currentPage: number
    totalPages: number
  }
}

export function AtasClient({ slug, initialAtas, pagination }: AtasClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Atas</h1>
          <p className="text-muted-foreground text-sm">Gerencie as atas oficiais geradas.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Gerar Ata
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar ata por nome..."
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
          />
        </div>
        <Button onClick={handleSearch} variant="secondary" className="md:w-32">
            Buscar
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Data</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {initialAtas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                    Nenhuma ata encontrada.
                  </td>
                </tr>
              ) : (
                initialAtas.map((ata) => (
                  <tr key={ata.id} className="hover:bg-accent/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-foreground">{ata.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(ata.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                        ata.arquivo_url
                          ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      )}>
                        {ata.arquivo_url ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {ata.arquivo_url ? "Gerada" : "Pendente"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {ata.arquivo_url && (
                          <>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver Ata">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Download PDF">
                              <Download className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {!ata.arquivo_url && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-3 text-xs font-bold hover:bg-primary hover:text-white border-primary/20"
                            onClick={() => setIsDialogOpen(true)}
                          >
                            Gerar Agora
                          </Button>
                        )}
                      </div>
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

      <GenerateAtasDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onGenerated={() => {
          router.refresh()
        }}
      />
    </div>
  )
}
