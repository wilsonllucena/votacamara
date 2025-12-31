"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Gavel, User } from "lucide-react"
import { MesaDiretoraModal } from "./MesaDiretoraModal"
import { ResourceList } from "../ResourceList"
import { upsertMesaMember, removeMesaMember } from "@/app/admin/_actions/mesa_diretora"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface MesaDiretoraClientProps {
  members: any[]
  cargos: any[]
  vereadores: any[]
  slug: string
  camaraId: string
}

export function MesaDiretoraClient({ members, cargos, vereadores, slug, camaraId }: MesaDiretoraClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<any | null>(null)

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
      const result = await upsertMesaMember(slug, camaraId, {
        id: editingMember?.id,
        ...data
      })
      
      if (result?.error) {
        showAlert("Erro", result.error)
      } else {
        setIsModalOpen(false)
        setEditingMember(null)
        router.refresh()
      }
    })
  }

  const handleDelete = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Remover da Mesa",
      description: "Tem certeza que deseja remover este membro da mesa diretora?",
      variant: "destructive",
      type: "confirm",
      onConfirm: async () => {
        startTransition(async () => {
          const result = await removeMesaMember(slug, id)
          if (result?.error) {
            showAlert("Erro", result.error)
          } else {
            router.refresh()
          }
        })
      }
    })
  }

  return (
    <>
      <ResourceList
        title="Mesa Diretora"
        description="Gerencie a composição da mesa diretora da sua Câmara."
        primaryAction={{
          label: "Adicionar Membro",
          onClick: () => {
            setEditingMember(null)
            setIsModalOpen(true)
          }
        }}
        isEmpty={members.length === 0}
        emptyMessage="Nenhum membro na mesa diretora."
      >
        <div className="bg-card/50 border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-4">Parlamentar</th>
                  <th className="px-6 py-4">Cargo</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span>{member.vereadores?.nome}</span>
                          <span className="text-muted-foreground text-xs">{member.vereadores?.partido}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-primary font-bold">
                       <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                        {member.cargos?.nome}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingMember(member)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-md"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(member.id)}
                          className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors rounded-md"
                          title="Remover"
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

      <MesaDiretoraModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        editingMember={editingMember}
        cargos={cargos}
        vereadores={vereadores}
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
