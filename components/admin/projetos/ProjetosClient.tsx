"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit2, Trash2, FileText, User, ScrollText, Plus, List, Search, Tag } from "lucide-react"
import { ProjetoForm, MateriaInputs } from "./ProjetoForm"
import { createProjeto, updateProjeto, deleteProjeto } from "@/app/admin/_actions/projetos"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

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
  projeto_situacoes?: {
    id: string
    nome: string
  } | null
  categoria_id?: string | null
  situacao_id?: string | null
}

interface ProjetosClientProps {
  projetos: Projeto[]
  slug: string
  vereadores: { id: string, nome: string, partido: string }[]
  categorias: { id: string, nome: string }[]
  situacoes: { id: string, nome: string }[]
  pagination: {
    currentPage: number
    totalPages: number
  }
}

export function ProjetosClient({ projetos, slug, vereadores, categorias, situacoes, pagination }: ProjetosClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("list")
  const [editingProjeto, setEditingProjeto] = useState<(MateriaInputs & { id: string }) | null>(null)
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")

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
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {editingProjeto ? "Editar Materia" : "Nova Materia"}
          </TabsTrigger>
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
                    <div className="flex gap-4 items-start">
                      <div className="h-12 w-12 rounded-lg bg-muted flex flex-shrink-0 items-center justify-center text-primary group-hover:bg-accent transition-colors">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-foreground text-lg">{projeto.numero || "S/N"}</h3>
                          <Badge variant="outline" className={`capitalize ${getStatusColor(projeto.status)} shadow-none`}>
                            {projeto.projeto_situacoes?.nome || formatStatus(projeto.status)}
                          </Badge>
                          {projeto.projeto_categorias && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 shadow-none font-bold uppercase tracking-widest text-[10px] gap-1.5">
                               <Tag className="w-3 h-3" />
                               {projeto.projeto_categorias.nome}
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-foreground/90 font-medium mb-1 truncate">{projeto.titulo}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">{projeto.ementa}</p>
                        
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="max-w-[300px] truncate">{authors}</span>
                          </div>
                          {projeto.texto_url && (
                            <div className="flex items-center gap-1">
                              <ScrollText className="h-3 w-3" />
                              <a href={projeto.texto_url} target="_blank" className="hover:text-primary hover:underline font-medium">Texto Original</a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
      
                    <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
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
                            situacao_id: projeto.situacao_id || undefined
                          })
                          setActiveTab("form")
                        }}
                        variant="outline" 
                        className="border-border bg-background text-foreground hover:bg-muted flex-1 md:flex-none font-medium h-9 shadow-none"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        onClick={() => handleDelete(projeto.id, projeto.titulo)}
                        variant="ghost" 
                        className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex-1 md:flex-none h-9 shadow-none"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border border-border rounded-xl">
                <div className="text-xs text-muted-foreground font-medium">
                  Página {pagination.currentPage} de {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set("page", (pagination.currentPage - 1).toString())
                      router.push(`?${params.toString()}`)
                    }}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1.5 text-xs font-bold bg-background border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
                  >
                    Anterior
                  </button>
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set("page", (pagination.currentPage + 1).toString())
                      router.push(`?${params.toString()}`)
                    }}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-1.5 text-xs font-bold bg-background border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
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
