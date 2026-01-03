"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Plus, List, Search, Edit2, UserX, Power, User } from "lucide-react"
import { CouncilorForm } from "./CouncilorForm"
import { toggleVereadorStatus, updateVereador, createVereador } from "@/app/admin/_actions/vereadores"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Pagination } from "@/components/admin/Pagination"
import { Tooltip } from "@/components/ui/tooltip"

interface CouncilorsClientProps {
  councilors: any[]
  slug: string
  pagination: {
    currentPage: number
    totalPages: number
  }
}
export function CouncilorsClient({ councilors, slug, pagination }: CouncilorsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("list")
  const [editingCouncilor, setEditingCouncilor] = useState<any | null>(null)
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

  const handleCreateOrUpdate = async (data: any) => {
    startTransition(async () => {
      let result;
      if (editingCouncilor) {
        result = await updateVereador(slug, editingCouncilor.id, data)
      } else {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => formData.append(key, value as string))
        result = await createVereador(slug, null, formData)
      }
      
      if (result?.error) {
        showAlert("Erro", result.error)
      } else {
        setEditingCouncilor(null)
        setActiveTab("list")
        router.refresh()
      }
    })
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'desativar' : 'ativar'
    setConfirmConfig({
      isOpen: true,
      title: `${currentStatus ? 'Desativar' : 'Ativar'} Vereador`,
      description: `Tem certeza que deseja ${action} este vereador?`,
      variant: currentStatus ? "destructive" : "default",
      type: "confirm",
      onConfirm: async () => {
        startTransition(async () => {
          await toggleVereadorStatus(slug, id, currentStatus)
          router.refresh()
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Vereadores</h1>
          <p className="text-muted-foreground text-sm">Gerencie os parlamentares da legislatura atual.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v)
        if (v === "list") setEditingCouncilor(null)
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Listar Vereadores
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {editingCouncilor ? "Editar Vereador" : "Novo Vereador"}
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
                placeholder="Buscar por nome..."
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </form>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Parlamentar</th>
                    <th className="px-6 py-4 hidden md:table-cell">Logo Partido</th>
                    <th className="px-6 py-4 hidden md:table-cell">Sigla</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {councilors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Nenhum vereador encontrado.
                      </td>
                    </tr>
                  ) : (
                    councilors.map((vereador) => (
                      <tr key={vereador.id} className="hover:bg-muted/50 transition-colors group">
                        <td className="px-4 sm:px-6 py-4 font-medium text-foreground">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted flex items-center justify-center font-bold text-[10px] sm:text-xs text-primary overflow-hidden border border-border shrink-0">
                              {vereador.foto_url ? (
                                <img src={vereador.foto_url} alt={vereador.nome} className="h-full w-full object-cover" />
                              ) : (
                                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="font-bold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none" title={vereador.nome}>{vereador.nome}</span>
                                {vereador.is_presidente && (
                                  <span className="text-[8px] sm:text-[10px] bg-primary/10 text-primary px-1 sm:px-1.5 py-0.5 rounded border border-primary/20 uppercase font-bold tracking-wider shrink-0">Pres.</span>
                                )}
                              </div>
                              <span className="text-muted-foreground text-[10px] md:hidden truncate">{vereador.partido}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          {vereador.partido_logo_url ? (
                            <img 
                              src={vereador.partido_logo_url} 
                              alt={vereador.partido} 
                              className="h-8 w-8 object-contain rounded p-1 bg-muted/50 border border-border"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded bg-muted/30 border border-border border-dashed flex items-center justify-center text-[10px] text-muted-foreground uppercase">
                              -
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                          <span className="px-2 py-1 rounded bg-muted border border-border text-xs font-bold uppercase">
                            {vereador.partido}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <Badge variant={vereador.ativo ? "default" : "secondary"} className={
                            vereador.ativo 
                            ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 shadow-none capitalize" 
                            : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 shadow-none capitalize"
                          }>
                            {vereador.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 sm:gap-2 items-center">
                            <Tooltip content="Editar Parlamentar">
                              <button 
                                type="button"
                                onClick={() => {
                                  const flatVereador = {
                                    ...vereador,
                                    email: vereador.profile_email,
                                    telefone: vereador.profile_telefone,
                                    isPresidente: vereador.is_presidente
                                  }
                                  setEditingCouncilor(flatVereador)
                                  setActiveTab("form")
                                }}
                                className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-md"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            </Tooltip>

                            <Tooltip content={vereador.ativo ? "Desativar Parlamentar" : "Ativar Parlamentar"}>
                              <button 
                                type="button"
                                onClick={() => handleToggleStatus(vereador.id, vereador.ativo)}
                                className={cn(
                                    "p-1.5 sm:p-2 transition-colors rounded-md",
                                    vereador.ativo 
                                        ? 'text-muted-foreground hover:text-red-400 hover:bg-red-400/10' 
                                        : 'text-muted-foreground hover:text-green-400 hover:bg-green-400/10'
                                )}
                              >
                                {vereador.ativo ? <UserX className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination 
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
            />
          </div>
        </TabsContent>

        <TabsContent value="form" className="animate-in slide-in-from-left-2 fade-in duration-500">
           <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
             <h2 className="text-xl font-bold text-foreground mb-6">
               {editingCouncilor ? "Editar Vereador" : "Cadastrar Novo Vereador"}
             </h2>
             <CouncilorForm 
               defaultValues={editingCouncilor || undefined}
               isPending={isPending}
               onSubmit={handleCreateOrUpdate}
               onCancel={() => {
                 setEditingCouncilor(null)
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
