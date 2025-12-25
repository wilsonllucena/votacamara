"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Calendar, Clock, FileText, Trash2 } from "lucide-react"
import { SessaoModal } from "./SessaoModal"
import { ResourceList } from "../ResourceList"
import { createSessao, updateSessao, deleteSessao, SessaoInputs } from "@/app/admin/_actions/sessoes"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

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
}

export function SessoesClient({ sessoes, slug, availableProjects, busyProjects, pagination }: SessoesClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSessao, setEditingSessao] = useState<Sessao | null>(null)
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

  const handleCreateOrUpdate = async (data: SessaoInputs) => {
    startTransition(async () => {
      let result;
      if (editingSessao) {
        result = await updateSessao(slug, editingSessao.id, data)
      } else {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (key === "projeto_ids") {
                formData.append(key, JSON.stringify(value))
            } else {
                formData.append(key, value as string)
            }
        })
        result = await createSessao(slug, null, formData)
      }
      
      if (result?.error) {
        showAlert("Erro", result.error)
      } else {
        setIsModalOpen(false)
        setEditingSessao(null)
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
    const params = new URLSearchParams(window.location.search)
    if (searchTerm) {
      params.set("search", searchTerm)
    } else {
      params.delete("search")
    }
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "agendada":
        return <Badge variant="outline" className="border-blue-500/20 text-blue-500 bg-blue-500/5">Agendada</Badge>
      case "aberta":
        return <Badge variant="default" className="bg-green-600 hover:bg-green-500 text-white shadow-sm shadow-green-600/20 border-none">Aberta</Badge>
      case "encerrada":
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Encerrada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <>
      <ResourceList
        title="Sessões"
        description="Gerencie as sessões ordinárias e extraordinárias."
        primaryAction={{
          label: "Nova Sessão",
          onClick: () => {
            setEditingSessao(null)
            setIsModalOpen(true)
          }
        }}
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          onSubmit: handleSearch,
          placeholder: "Buscar por título..."
        }}
        pagination={pagination}
        isEmpty={sessoes.length === 0}
        emptyMessage="Nenhuma sessão encontrada."
        emptyIcon={<Calendar className="h-10 w-10 opacity-20" />}
      >
        <div className="bg-card/50 border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-4">Sessão</th>
                  <th className="px-6 py-4 hidden md:table-cell">Tipo</th>
                  <th className="px-6 py-4">Data / Hora</th>
                  <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sessoes.map((sessao) => (
                  <tr key={sessao.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex flex-col">
                        <span className="font-bold text-base">{sessao.titulo}</span>
                        <span className="text-xs text-muted-foreground md:hidden">{sessao.tipo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <Badge variant="outline" className="border-border text-muted-foreground capitalize">
                        {sessao.tipo}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-primary/70" />
                          <span className="text-xs">
                            {sessao.data ? format(new Date(sessao.data + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR }) : 'Data não informada'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-primary/70" />
                          <span className="text-xs">{sessao.hora}h</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {getStatusBadge(sessao.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/${slug}/sessoes/${sessao.id}/manager`}>
                          <Button variant="outline" size="sm" className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 h-8">
                            Gerenciar
                          </Button>
                        </Link>
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingSessao(sessao)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-md"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(sessao.id)}
                          className="p-2 text-muted-foreground hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-md"
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

      <SessaoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        editingSessao={editingSessao}
        isPending={isPending}
        availableProjects={availableProjects}
        busyProjects={busyProjects}
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
