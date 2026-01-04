"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Plus, 
  List, 
  FileText, 
  BadgeInfo, 
  MoreVertical, 
  Search 
} from "lucide-react"
import { ComissaoForm } from "@/components/admin/comissoes/ComissaoForm"
import { Pagination } from "@/components/admin/Pagination"
import { Tooltip } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { createMongoAbility, RawRuleOf, MongoAbility } from "@casl/ability"
import { Action, Subject } from "@/lib/casl/ability"
import { useMemo } from "react"

interface Comissao {
  id: string
  nome: string
  tipo: string
  descricao: string
  comissao_membros: any[]
}

interface ComissoesClientProps {
  slug: string
  initialComissoes: Comissao[]
  vereadores: any[]
  materias: any[]
  pagination: {
    currentPage: number
    totalPages: number
  }
  rules?: RawRuleOf<MongoAbility<[Action, Subject]>>[]
}

export function ComissoesClient({ slug, initialComissoes, vereadores, materias, pagination, rules = [] }: ComissoesClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("list")
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
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCreateSuccess = () => {
    setActiveTab("list")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Comissões Parlamentares</h1>
          <p className="text-muted-foreground text-sm">Gerencie as comissões, membros e matérias vinculadas.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Listar Comissões
          </TabsTrigger>
          {can('manage', 'Comissao') && (
            <TabsTrigger value="new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Comissão
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-4 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar comissão por nome..."
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
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Comissão</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipo</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Membros</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Matérias</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {initialComissoes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                        Nenhuma comissão encontrada.
                      </td>
                    </tr>
                  ) : (
                    initialComissoes.map((comissao) => (
                      <tr key={comissao.id} className="hover:bg-accent/30 transition-colors group">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-foreground text-sm sm:text-base truncate max-w-[150px] sm:max-w-[300px]">{comissao.nome}</span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-md">{comissao.descricao}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                          <Badge variant="outline" className={cn(
                              "font-bold text-[10px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5",
                              comissao.tipo === "Permanente" ? "border-blue-500/20 bg-blue-500/5 text-blue-500" : "border-amber-500/20 bg-amber-500/5 text-amber-500"
                          )}>
                            {comissao.tipo}
                          </Badge>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-foreground">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
                            <span className="font-semibold">{comissao.comissao_membros?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-foreground">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{0}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          {can('manage', 'Comissao') && (
                            <Tooltip content="Gerenciar Comissão">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                          )}
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
        </TabsContent>

        <TabsContent value="new" className="animate-in slide-in-from-left-2 fade-in duration-500">
           <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
             <ComissaoForm 
               slug={slug}
               vereadores={vereadores} 
               materias={materias} 
               onSuccess={handleCreateSuccess}
             />
           </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

