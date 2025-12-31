"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, UserX, Power, User } from "lucide-react"
import { CouncilorModal } from "./CouncilorModal"
import { ResourceList } from "../ResourceList"
import { toggleVereadorStatus, updateVereador, createVereador } from "@/app/admin/_actions/vereadores"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

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
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCouncilor, setEditingCouncilor] = useState<any | null>(null)
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
        setIsModalOpen(false)
        setEditingCouncilor(null)
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
    <>
      <ResourceList
        title="Vereadores"
        description="Gerencie os parlamentares da legislatura atual."
        primaryAction={{
          label: "Novo Vereador",
          onClick: () => {
            setEditingCouncilor(null)
            setIsModalOpen(true)
          }
        }}
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          onSubmit: handleSearch,
          placeholder: "Buscar por nome..."
        }}
        pagination={pagination}
        isEmpty={councilors.length === 0}
        emptyMessage="Nenhum vereador encontrado."
      >
        <div className="bg-card/50 border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-4">Parlamentar</th>
                  <th className="px-6 py-4 hidden md:table-cell">Partido</th>
                  <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {councilors.map((vereador) => (
                  <tr key={vereador.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-primary overflow-hidden border border-border">
                          {vereador.foto_url ? (
                            <img src={vereador.foto_url} alt={vereador.nome} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span>{vereador.nome}</span>
                            {vereador.is_presidente && (
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 uppercase font-bold tracking-wider">Presidente</span>
                            )}
                          </div>
                          <span className="text-muted-foreground text-xs md:hidden">{vereador.partido}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                      <span className="px-2 py-1 rounded bg-muted border border-border text-xs font-bold">
                        {vereador.partido}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <Badge variant={vereador.ativo ? "default" : "secondary"} className={
                        vereador.ativo 
                        ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20" 
                        : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                      }>
                        {vereador.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
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
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-md"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleToggleStatus(vereador.id, vereador.ativo)}
                          className={`p-2 transition-colors rounded-md ${vereador.ativo ? 'text-muted-foreground hover:text-red-400 hover:bg-red-400/10' : 'text-muted-foreground hover:text-green-400 hover:bg-green-400/10'}`}
                          title={vereador.ativo ? "Desativar" : "Ativar"}
                        >
                          {vereador.ativo ? <UserX className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ResourceList>

      <CouncilorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        editingCouncilor={editingCouncilor}
        isPending={isPending}
      />

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
        type={confirmConfig.type}
      />
    </>
  )
}
