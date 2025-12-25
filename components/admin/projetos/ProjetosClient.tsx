"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, FileText, User, ScrollText } from "lucide-react"
import { ProjetoModal } from "./ProjetoModal"
import { ProjetoInputs } from "./ProjetoForm"
import { ResourceList } from "../ResourceList"
import { createProjeto, updateProjeto, deleteProjeto } from "@/app/admin/_actions/projetos"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface Projeto {
  id: string
  numero: string
  titulo: string
  ementa: string
  autor: string
  autor_id?: string | null
  texto_url?: string | null
  status: string
  created_at: string
}

interface ProjetosClientProps {
  projetos: Projeto[]
  slug: string
  pagination: {
    currentPage: number
    totalPages: number
  }
}

export function ProjetosClient({ projetos, slug, pagination }: ProjetosClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProjeto, setEditingProjeto] = useState<(ProjetoInputs & { id: string }) | null>(null)
  const [vereadores, setVereadores] = useState<{ id: string, nome: string }[]>([])
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

  // Fetch vereadores for the modal dropdown
  useEffect(() => {
    const fetchVereadores = async () => {
        const { data } = await supabase
            .from("vereadores")
            .select("id, nome")
            .order("nome")
        
        if (data) setVereadores(data)
    }
    fetchVereadores()
  }, [supabase])

  const handleCreateOrUpdate = async (data: ProjetoInputs) => {
    startTransition(async () => {
      let result;
      if (editingProjeto) {
        result = await updateProjeto(slug, editingProjeto.id, data)
      } else {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => formData.append(key, value as string))
        result = await createProjeto(slug, null, formData)
      }
      
      if (result?.error) {
        showAlert("Erro", result.error)
      } else {
        setIsModalOpen(false)
        setEditingProjeto(null)
        router.refresh()
      }
    })
  }

  const handleDelete = async (id: string, titulo: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Excluir Projeto",
      description: `Tem certeza que deseja excluir o projeto "${titulo}"? Esta ação não pode ser desfeita.`,
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
    <>
      <ResourceList
        title="Projetos de Lei"
        description="Gerencie as proposituras legislativas."
        primaryAction={{
          label: "Novo Projeto",
          onClick: () => {
            setEditingProjeto(null)
            setIsModalOpen(true)
          }
        }}
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          onSubmit: handleSearch,
          placeholder: "Buscar por título ou número..."
        }}
        pagination={pagination}
        isEmpty={!projetos || projetos.length === 0}
        emptyMessage="Nenhum projeto encontrado."
        emptyIcon={<FileText className="h-10 w-10 opacity-20" />}
      >
        <div className="space-y-4">
          {projetos.map((projeto) => (
            <div key={projeto.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card/50 border border-border p-4 rounded-xl hover:bg-muted/50 transition-all duration-200 group shadow-sm">
              <div className="flex gap-4 items-start">
                <div className="h-12 w-12 rounded-lg bg-muted flex flex-shrink-0 items-center justify-center text-primary group-hover:bg-accent transition-colors">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground text-lg">{projeto.numero || "S/N"}</h3>
                    <Badge variant="outline" className={`capitalize ${getStatusColor(projeto.status)}`}>
                      {formatStatus(projeto.status)}
                    </Badge>
                  </div>
                  <h4 className="text-foreground/90 font-medium mb-1">{projeto.titulo}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">{projeto.ementa}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {projeto.autor}
                    </div>
                    {projeto.texto_url && (
                      <div className="flex items-center gap-1">
                        <ScrollText className="h-3 w-3" />
                        <a href={projeto.texto_url} target="_blank" className="hover:text-primary hover:underline">Texto Original</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Button 
                  onClick={() => {
                    setEditingProjeto({
                      id: projeto.id,
                      numero: projeto.numero,
                      titulo: projeto.titulo,
                      ementa: projeto.ementa,
                      autor: projeto.autor,
                      autor_id: projeto.autor_id || undefined,
                      texto_url: projeto.texto_url || undefined,
                      status: formatStatus(projeto.status) as ProjetoInputs["status"]
                    })
                    setIsModalOpen(true)
                  }}
                  variant="outline" 
                  className="border-border bg-background text-foreground hover:bg-muted flex-1 md:flex-none font-medium h-9"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  onClick={() => handleDelete(projeto.id, projeto.titulo)}
                  variant="ghost" 
                  className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex-1 md:flex-none h-9"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ResourceList>

      <ProjetoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        editingProjeto={editingProjeto}
        isPending={isPending}
        vereadores={vereadores}
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
