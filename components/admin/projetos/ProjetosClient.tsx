"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit2, Trash2, FileText, User, ScrollText } from "lucide-react"
import { ProjetoModal } from "./ProjetoModal"
import { ProjetoInputs } from "./ProjetoForm"
import { createProjeto, updateProjeto, deleteProjeto } from "@/app/admin/_actions/projetos"

interface Projeto {
  id: string
  numero: string
  titulo: string
  ementa: string
  autor: string
  texto_url?: string | null
  status: string
  created_at: string
}

interface ProjetosClientProps {
  projetos: Projeto[]
  slug: string
}

export function ProjetosClient({ projetos, slug }: ProjetosClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProjeto, setEditingProjeto] = useState<(ProjetoInputs & { id: string }) | null>(null)
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")

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
        alert(result.error)
      } else {
        setIsModalOpen(false)
        setEditingProjeto(null)
        router.refresh()
      }
    })
  }

  const handleDelete = async (id: string, titulo: string) => {
    if (confirm(`Tem certeza que deseja excluir o projeto "${titulo}"?`)) {
      startTransition(async () => {
        const result = await deleteProjeto(slug, id)
        if (result?.error) {
          alert(result.error)
        } else {
          router.refresh()
        }
      })
    }
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
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-700/50"
    }
  }

  return (
    <div className="space-y-6">
       {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Projetos de Lei</h2>
            <p className="text-zinc-400">Gerencie as proposituras legislativas.</p>
         </div>
         <Button 
            onClick={() => {
              setEditingProjeto(null)
              setIsModalOpen(true)
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-blue-500/50"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Projeto
         </Button>
      </div>

      {/* Filters */}
        <form onSubmit={handleSearch} className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Buscar por título ou número..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
            </div>
            <Button type="submit" variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hidden sm:flex">
                Buscar
            </Button>
        </form>

      {/* List */}
      {!projetos || projetos.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-zinc-800 text-zinc-500">
              Nenhum projeto encontrado.
          </div>
      ) : (
          <div className="space-y-4">
              {projetos.map((projeto) => (
                  <div key={projeto.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl hover:bg-zinc-900/80 transition-colors group">
                      <div className="flex gap-4 items-start">
                          <div className="h-12 w-12 rounded-lg bg-zinc-800 flex flex-shrink-0 items-center justify-center text-blue-500 group-hover:bg-zinc-700 transition-colors">
                              <FileText className="h-6 w-6" />
                          </div>
                          <div>
                              <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-white text-lg">{projeto.numero || "S/N"}</h3>
                                  <Badge variant="outline" className={`capitalize ${getStatusColor(projeto.status)}`}>
                                      {formatStatus(projeto.status)}
                                  </Badge>
                              </div>
                              <h4 className="text-zinc-200 font-medium mb-1">{projeto.titulo}</h4>
                              <p className="text-sm text-zinc-500 line-clamp-2 max-w-2xl">{projeto.ementa}</p>
                              
                              <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500">
                                  <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {projeto.autor}
                                  </div>
                                  {projeto.texto_url && (
                                    <div className="flex items-center gap-1">
                                        <ScrollText className="h-3 w-3" />
                                        <a href={projeto.texto_url} target="_blank" className="hover:text-blue-400 hover:underline">Texto Original</a>
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
                                  texto_url: projeto.texto_url || undefined,
                                  status: formatStatus(projeto.status) as ProjetoInputs["status"]
                                })
                                setIsModalOpen(true)
                              }}
                              variant="outline" 
                              className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 flex-1 md:flex-none"
                            >
                               <Edit2 className="h-4 w-4 mr-2" />
                               Editar
                          </Button>
                          <Button 
                              onClick={() => handleDelete(projeto.id, projeto.titulo)}
                              variant="ghost" 
                              className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 flex-1 md:flex-none"
                            >
                               <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      <ProjetoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        editingProjeto={editingProjeto}
        isPending={isPending}
      />
    </div>
  )
}
