"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, Briefcase } from "lucide-react"
import { CargoModal } from "./CargoModal"
import { ResourceList } from "../ResourceList"
import { createCargo, updateCargo, deleteCargo } from "@/app/admin/_actions/cargos"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

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
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const handleCreateOrUpdate = async (data: any) => {
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
        setIsModalOpen(false)
        setEditingCargo(null)
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
    <>
      <ResourceList
        title="Cargos"
        description="Gerencie os cargos disponíveis para os parlamentares e servidores."
        primaryAction={{
          label: "Novo Cargo",
          onClick: () => {
            setEditingCargo(null)
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
        isEmpty={cargos.length === 0}
        emptyMessage="Nenhum cargo encontrado."
      >
        <div className="bg-card/50 border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-4">Cargo</th>
                  <th className="px-6 py-4 hidden md:table-cell">Descrição</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cargos.map((cargo) => (
                  <tr key={cargo.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-primary">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span>{cargo.nome}</span>
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
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-md"
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ResourceList>

      <CargoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        editingCargo={editingCargo}
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
