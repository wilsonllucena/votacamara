"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Edit2, Trash2, Briefcase, Plus, List, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createCargo, updateCargo, deleteCargo } from "@/app/admin/_actions/cargos"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { CargoForm, CargoInputs } from "./CargoForm"

interface CargosClientProps {
  cargos: any[]
  slug: string
  pagination: {
    currentPage: number
    totalPages: number
  }
}
export function CargosClient({ cargos, slug, pagination }: CargosClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("list")
  const [editingCargo, setEditingCargo] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

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

  const handleCreateOrUpdate = async (data: CargoInputs) => {
    startTransition(async () => {
      let result;
      if (editingCargo) {
        result = await updateCargo(slug, editingCargo.id, data)
      } else {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => formData.append(key, value as string))
        result = await createCargo(slug, null, formData)
      }
      
      if (result?.error) {
        showAlert("Erro", result.error)
      } else {
        setEditingCargo(null)
        setActiveTab("list")
        router.refresh()
      }
    })
  }

  const handleDelete = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Excluir Cargo",
      description: "Tem certeza que deseja excluir este cargo? Esta ação não pode ser desfeita.",
      variant: "destructive",
      type: "confirm",
      onConfirm: async () => {
        startTransition(async () => {
          const result = await deleteCargo(slug, id)
          if (result?.error) {
            showAlert("Erro", result.error)
          } else {
            router.refresh()
          }
        })
      }
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(window.location.search)
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
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Cargos</h1>
          <p className="text-muted-foreground text-sm">Gerencie os cargos disponíveis para os parlamentares e servidores.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v)
        if (v === "list") setEditingCargo(null)
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Listar Cargos
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {editingCargo ? "Editar Cargo" : "Novo Cargo"}
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
                    <th className="px-6 py-4">Cargo</th>
                    <th className="px-6 py-4 hidden md:table-cell">Descrição</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cargos.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                        Nenhum cargo encontrado.
                      </td>
                    </tr>
                  ) : (
                    cargos.map((cargo) => (
                      <tr key={cargo.id} className="hover:bg-muted/50 transition-colors group">
                        <td className="px-6 py-4 font-medium text-foreground">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                              <Briefcase className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold">{cargo.nome}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden md:table-cell max-w-xs truncate">
                          {cargo.descricao || "Sem descrição"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              type="button"
                              onClick={() => {
                                setEditingCargo(cargo)
                                setActiveTab("form")
                              }}
                              className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-md"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDelete(cargo.id)}
                              className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors rounded-md"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-t border-border">
                <div className="text-xs text-muted-foreground font-medium">
                  Página {pagination.currentPage} de {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams(window.location.search)
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
                      const params = new URLSearchParams(window.location.search)
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
           <div className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-2xl">
             <h2 className="text-xl font-bold text-foreground mb-6">
               {editingCargo ? "Editar Cargo" : "Cadastrar Novo Cargo"}
             </h2>
             <CargoForm 
               defaultValues={editingCargo || undefined}
               isPending={isPending}
               onSubmit={handleCreateOrUpdate}
               onCancel={() => {
                 setEditingCargo(null)
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
