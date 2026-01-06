"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit2, Calendar, Clock, FileText, Trash2, List, Search, Link as LinkIcon, Check } from "lucide-react"
import { SessaoForm } from "./SessaoForm"
import { createSessao, updateSessao, deleteSessao, SessaoInputs } from "@/app/admin/_actions/sessoes"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Pagination } from "@/components/admin/Pagination"
import { Tooltip } from "@/components/ui/tooltip"

import { createMongoAbility, RawRuleOf, MongoAbility } from "@casl/ability"
import { Action, Subject } from "@/lib/casl/ability"
import { useMemo } from "react"

interface Sessao {
  id: string
  titulo: string
  tipo: "ordinaria" | "extraordinaria"
  status: "agendada" | "aberta" | "encerrada"
  data: string
  hora: string
  camara_id: string
  created_at: string
  projeto_ids?: string[]
}

interface SessoesClientProps {
  sessoes: Sessao[]
  slug: string
  availableProjects: any[]
  busyProjects: any[]
  pagination: {
    currentPage: number
    totalPages: number
  }
  rules?: RawRuleOf<MongoAbility<[Action, Subject]>>[]
}

export function SessoesClient({ sessoes, slug, availableProjects, busyProjects, pagination, rules = [] }: SessoesClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("list")
  const [editingSessao, setEditingSessao] = useState<Sessao | null>(null)
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

  const handleCreateOrUpdate = async (data: SessaoInputs) => {
    startTransition(async () => {
      let result;
      if (editingSessao) {
        result = await updateSessao(slug, editingSessao.id, data)
      } else {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (key === "projeto_ids" && Array.isArray(value)) {
                value.forEach(id => formData.append("projeto_ids", id))
            } else if (value !== undefined && value !== null) {
                formData.append(key, value.toString())
            }
        })
        result = await createSessao(slug, null, formData)
      }
      
      const anyResult = result as any
      if (anyResult?.error) {
        showAlert("Erro", anyResult.error)
      } else if (anyResult?.errors) {
        // Handle validation errors from zod
        const firstError = Object.values(anyResult.errors)[0] as string[]
        showAlert("Erro de Validação", firstError[0])
      } else {
        setEditingSessao(null)
        setActiveTab("list")
        router.refresh()
      }
    })
  }

  const handleDelete = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Excluir Sessão",
      description: "Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.",
      variant: "destructive",
      type: "confirm",
      onConfirm: async () => {
        startTransition(async () => {
          const result = await deleteSessao(slug, id)
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

  const handleCopyPublicLink = (slug: string) => {
    const publicUrl = `${window.location.origin}/public/${slug}`
    navigator.clipboard.writeText(publicUrl).then(() => {
      showAlert(
        "Link copiado!",
        "O link público da sessão foi copiado para a área de transferência."
      )
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "agendada":
        return <Badge variant="outline" className="border-blue-500/20 text-blue-500 bg-blue-500/5 shadow-none">Agendada</Badge>
      case "aberta":
        return <Badge variant="default" className="bg-green-600 hover:bg-green-500 text-white shadow-sm shadow-green-600/20 border-none">Aberta</Badge>
      case "encerrada":
        return <Badge variant="secondary" className="bg-muted text-muted-foreground shadow-none">Encerrada</Badge>
      default:
        return <Badge variant="outline" className="shadow-none">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Sessões Legislativas</h1>
          <p className="text-muted-foreground text-sm">Gerencie as sessões ordinárias e extraordinárias da Câmara.</p>
        </div>
      </div>

      <Tabs id="sessoes-tabs" value={activeTab} onValueChange={(v) => {
        setActiveTab(v)
        if (v === "list") setEditingSessao(null)
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Listar Sessões
          </TabsTrigger>
          {can('manage', 'Sessao') && (
            <TabsTrigger value="form" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {editingSessao ? "Editar Sessão" : "Nova Sessão"}
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
                placeholder="Buscar por título..."
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </form>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Sessão</th>
                    <th className="px-6 py-4 hidden md:table-cell">Tipo</th>
                    <th className="px-6 py-4">Data / Hora</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sessoes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Calendar className="h-10 w-10 opacity-20" />
                          <p>Nenhuma sessão encontrada.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sessoes.map((sessao) => (
                      <tr key={sessao.id} className="hover:bg-muted/50 transition-colors group">
                        <td className="px-4 sm:px-6 py-4 font-medium text-foreground">
                          <div className="flex flex-col max-w-[150px] sm:max-w-none">
                            <span className="font-bold text-sm sm:text-base truncate">{sessao.titulo}</span>
                            <span className="text-[10px] text-muted-foreground md:hidden capitalize">{sessao.tipo}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <Badge variant="outline" className="border-border text-muted-foreground capitalize shadow-none">
                            {sessao.tipo}
                          </Badge>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-muted-foreground">
                          <div className="flex flex-col gap-0.5 sm:gap-1">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary/70" />
                              <span className="text-[10px] sm:text-xs">
                                {sessao.data ? format(new Date(sessao.data + 'T00:00:00'), "dd/MM", { locale: ptBR }) : '??'}
                                <span className="hidden sm:inline">/{sessao.data?.split('-')[0]}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary/70" />
                              <span className="text-[10px] sm:text-xs">{sessao.hora}h</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          {getStatusBadge(sessao.status)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-1 sm:gap-2">
                            <Link href={`/admin/${slug}/sessoes/${sessao.id}/manager`}>
                              <Button variant="outline" size="sm" className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 h-7 sm:h-8 font-bold text-[9px] sm:text-xs uppercase shadow-none px-2 sm:px-4">
                                <span className="sm:inline hidden">Gerenciar</span>
                                <span className="sm:hidden">GER.</span>
                              </Button>
                            </Link>

                            {can('manage', 'Sessao') && (
                              <Tooltip content="Editar Sessão">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setEditingSessao(sessao)
                                    setActiveTab("form")
                                  }}
                                  className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-md"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                              </Tooltip>
                            )}

                            <Tooltip content="Copiar Link Público">
                              <button 
                                type="button"
                                onClick={() => handleCopyPublicLink(slug)}
                                className="p-1.5 sm:p-2 text-muted-foreground hover:text-green-500 transition-colors hover:bg-green-500/10 rounded-md"
                              >
                                <LinkIcon className="h-4 w-4" />
                              </button>
                            </Tooltip>

                            {can('delete', 'Sessao') && (
                              <Tooltip content="Excluir Sessão">
                                <button 
                                  type="button"
                                  onClick={() => handleDelete(sessao.id)}
                                  className="p-1.5 sm:p-2 text-muted-foreground hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-md"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </Tooltip>
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
        </TabsContent>

        <TabsContent value="form" className="animate-in slide-in-from-left-2 fade-in duration-500">
           <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
             <h2 className="text-xl font-bold text-foreground mb-6">
               {editingSessao ? "Editar Sessão" : "Cadastrar Nova Sessão Legislativa"}
             </h2>
             <SessaoForm 
               defaultValues={editingSessao || undefined}
               isPending={isPending}
               availableProjects={availableProjects.filter(p => 
                    p.situacao === "EM_PAUTA" || 
                    editingSessao?.projeto_ids?.includes(p.id)
                )}
               busyProjects={busyProjects}
               onSubmit={handleCreateOrUpdate}
               onError={(message) => showAlert("Atenção", message)}
               onCancel={() => {
                 setEditingSessao(null)
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
