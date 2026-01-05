"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit2, Trash2, FileText, User, ScrollText, Plus, List, Search, Tag, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/ui/tooltip"
import { ProjetoForm, MateriaInputs } from "./ProjetoForm"
import { createProjeto, updateProjeto, deleteProjeto } from "@/app/admin/_actions/projetos"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Pagination } from "@/components/admin/Pagination"

interface Projeto {
  id: string
  numero: string
  titulo: string
  ementa: string
  texto_url?: string | null
  status: string
  created_at: string
  projeto_autores?: {
    vereadores: {
      id: string
      nome: string
      partido: string
    }
  }[]
  projeto_categorias?: {
    id: string
    nome: string
  } | null
  categoria_id?: string | null
  situacao?: string | null
  tipo_materia_id?: string | null
  tipos_materia?: {
    id: string
    nome: string
    sigla: string
  } | null
}

import { createMongoAbility, RawRuleOf, MongoAbility } from "@casl/ability"
import { Action, Subject } from "@/lib/casl/ability"
import { useMemo } from "react"

interface ProjetosClientProps {
  projetos: Projeto[]
  slug: string
  vereadores: { id: string, nome: string, partido: string }[]
  categorias: { id: string, nome: string }[]
  situacoes: { id: string, nome: string, label: string }[]
  tiposMateria: { id: string, nome: string, sigla: string }[]
  pagination: {
    currentPage: number
    totalPages: number
  }
  rules?: RawRuleOf<MongoAbility<[Action, Subject]>>[]
}

export function ProjetosClient({ projetos, slug, vereadores, categorias, situacoes, tiposMateria, pagination, rules = [] }: ProjetosClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("list")
  const [editingProjeto, setEditingProjeto] = useState<(MateriaInputs & { id: string }) | null>(null)
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")

  // Reconstruir abilidade no cliente de forma estável
  const ability = useMemo(() => createMongoAbility<[Action, Subject]>(rules), [rules])
  const can = (action: Action, subject: Subject) => ability.can(action, subject)

  // ConfirmDialog State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm?: () => void
    variant?: "default" | "destructive"
    type?: "confirm" | "alert"
  }>({
    isOpen: false,
    title: "",
    description: "",
  })

  const showAlert = (title: string, description: string) => {
    setConfirmConfig({
      isOpen: true,
      title,
      description,
      type: "alert",
      variant: "default",
    })
  }

  const handleCreateOrUpdate = async (data: MateriaInputs) => {
    startTransition(async () => {
      let result;
      if (editingProjeto) {
        result = await updateProjeto(slug, editingProjeto.id, data)
      } else {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'autores_ids') {
                (value as string[]).forEach(id => formData.append('autores_ids', id))
            } else {
                formData.append(key, value as string)
            }
        })
        result = await createProjeto(slug, null, formData)
      }
      
      if (result?.error) {
        showAlert("Erro", result.error)
      } else {
        setEditingProjeto(null)
        setActiveTab("list")
        router.refresh()
      }
    })
  }

  const handleDelete = async (id: string, titulo: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Excluir Materia",
      description: `Tem certeza que deseja excluir a materia "${titulo}"? Esta ação não pode ser desfeita.`,
      variant: "destructive",
      type: "confirm",
      onConfirm: async () => {
        startTransition(async () => {
          const result = await deleteProjeto(slug, id)
          if (result?.error) {
            showAlert("Erro ao excluir", result.error)
          } else {
            router.refresh()
          }
        })
      }
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm) {
      params.set("search", searchTerm)
    } else {
      params.delete("search")
    }
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      rascunho: "Rascunho",
      em_pauta: "Em Pauta",
      votado: "Votado",
      aprovado: "Aprovado",
      rejeitado: "Rejeitado",
    }
    return map[status] || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_pauta": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "votado": return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "aprovado": return "bg-green-500/10 text-green-500 border-green-500/20"
      case "rejeitado": return "bg-red-500/10 text-red-500 border-red-500/20"
      default: return "bg-muted text-muted-foreground border-border"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Materias Legislativas</h1>
          <p className="text-muted-foreground text-sm">Gerencie as proposituras legislativas da Câmara.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v)
        if (v === "list") setEditingProjeto(null)
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Listar Materias
          </TabsTrigger>
          {(can('create', 'Materia') || editingProjeto) && (
            <TabsTrigger value="form" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {editingProjeto ? "Editar Materia" : "Nova Materia"}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-4 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título ou número..."
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </form>
          </div>

          <div className="space-y-4">
            {(!projetos || projetos.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 bg-card border border-border border-dashed rounded-xl text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-20" />
                <p>Nenhuma materia encontrada.</p>
              </div>
            ) : (
              projetos.map((projeto) => {
                const authors = projeto.projeto_autores?.map(pa => pa.vereadores.nome).join(", ") || "Sem autor"
                const authorsIds = projeto.projeto_autores?.map(pa => pa.vereadores.id) || []

                return (
                  <div key={projeto.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card/50 border border-border p-4 rounded-xl hover:bg-muted/50 transition-all duration-200 group shadow-sm">
                    <div className="flex gap-3 sm:gap-4 items-start min-w-0 flex-1">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-muted flex flex-shrink-0 items-center justify-center text-primary group-hover:bg-accent transition-colors">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-foreground text-base sm:text-lg shrink-0">{projeto.numero || "S/N"}</h3>
                          <Badge variant="outline" className={cn("text-[9px] sm:text-xs capitalize shadow-none px-1.5 py-0 sm:px-2 sm:py-0.5", getStatusColor(projeto.status))}>
                            {projeto.situacao || formatStatus(projeto.status)}
                          </Badge>
                          {projeto.projeto_categorias && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 shadow-none font-bold uppercase tracking-widest text-[8px] sm:text-[10px] gap-1 sm:gap-1.5 px-1.5 py-0 sm:px-2 sm:py-0.5">
                             <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                             <span className="truncate max-w-[80px] sm:max-w-none">{projeto.projeto_categorias.nome}</span>
                            </Badge>
                          )}
                          {projeto.tipos_materia && (
                            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-none font-bold uppercase tracking-widest text-[8px] sm:text-[10px] px-1.5 py-0 sm:px-2 sm:py-0.5">
                               {projeto.tipos_materia.sigla}
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-foreground/90 font-medium mb-0.5 sm:mb-1 text-sm sm:text-base truncate">{projeto.titulo}</h4>
                        <p className="text-[10px] sm:text-sm text-muted-foreground line-clamp-2 max-w-2xl">{projeto.ementa}</p>
                        
                        <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-[10px] sm:text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1 min-w-0">
                            <User className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[150px] sm:max-w-[300px]">{authors}</span>
                          </div>
                          {projeto.texto_url && (
                            <div className="flex items-center gap-1">
                              <ScrollText className="h-3 w-3 shrink-0" />
                              <a href={projeto.texto_url} target="_blank" className="hover:text-primary hover:underline font-medium">Doc</a>
                              <span className="hidden sm:inline">Texto Original</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
      
                     <div className="flex gap-2 w-full md:w-auto mt-3 md:mt-0 justify-end md:justify-start border-t md:border-t-0 pt-3 md:pt-0 border-border/50">
                      <Tooltip content="Visualizar Matéria">
                        <Button 
                          onClick={() => router.push(`/admin/${slug}/projetos/${projeto.id}`)}
                          variant="outline" 
                          className="border-border bg-background text-foreground hover:bg-muted font-medium h-8 sm:h-9 shadow-none px-2 sm:px-4 flex-1 md:flex-none"
                        >
                          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Visualizar</span>
                        </Button>
                      </Tooltip>

                      {can('update', { ...projeto, autores_ids: authorsIds } as any) && (
                        <Tooltip content="Editar Matéria">
                          <Button 
                            onClick={() => {
                              setEditingProjeto({
                                id: projeto.id,
                                numero: projeto.numero,
                                titulo: projeto.titulo,
                                ementa: projeto.ementa,
                                autores_ids: authorsIds,
                                texto_url: projeto.texto_url || undefined,
                                status: projeto.status,
                              categoria_id: projeto.categoria_id || undefined,
                              situacao: projeto.situacao || undefined,
                                tipo_materia_id: projeto.tipo_materia_id || undefined
                              })
                              setActiveTab("form")
                            }}
                            variant="outline" 
                            className="border-border bg-background text-foreground hover:bg-muted font-medium h-8 sm:h-9 shadow-none px-2 sm:px-4 flex-1 md:flex-none"
                          >
                            <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Editar</span>
                          </Button>
                        </Tooltip>
                      )}

                      {can('delete', 'Materia') && (
                        <Tooltip content="Excluir Matéria">
                          <Button 
                            onClick={() => handleDelete(projeto.id, projeto.titulo)}
                            variant="ghost" 
                            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-8 sm:h-9 shadow-none px-2 sm:px-3 flex-1 md:flex-none"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="sm:hidden ml-2 text-xs">Excluir</span>
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                )
              })
            )}

            <Pagination 
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
            />
          </div>
        </TabsContent>

        <TabsContent value="form" className="animate-in slide-in-from-left-2 fade-in duration-500">
           <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
             <h2 className="text-xl font-bold text-foreground mb-6">
               {editingProjeto ? "Editar Materia" : "Cadastrar Nova Materia Legislativa"}
             </h2>
             <ProjetoForm 
               defaultValues={editingProjeto || undefined}
               isPending={isPending}
               vereadores={vereadores}
               categorias={categorias}
               situacoes={situacoes}
               tiposMateria={tiposMateria}
               onSubmit={handleCreateOrUpdate}
               onCancel={() => {
                 setEditingProjeto(null)
                 setActiveTab("list")
               }}
             />
           </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
        type={confirmConfig.type}
      />
    </div>
  )
}
