"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit2, Trash2, Calendar, Clock, ListFilter } from "lucide-react"
import { SessaoModal } from "./SessaoModal"
import { SessaoInputs } from "@/app/admin/_actions/sessoes"
import { createSessao, updateSessao, deleteSessao } from "@/app/admin/_actions/sessoes"
import { Input } from "@/components/ui/input"

interface Sessao {
  id: string
  titulo: string
  tipo: string
  status: string
  iniciou_em: string
  encerrou_em?: string | null
  pauta_itens?: { projeto_id: string }[]
}

interface SessoesClientProps {
  sessoes: Sessao[]
  slug: string
  availableProjects?: { id: string; titulo: string; numero: string }[]
  busyProjects?: { projeto_id: string; sessao_id: string }[]
}

export function SessoesClient({ sessoes, slug, availableProjects = [], busyProjects = [] }: SessoesClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSessao, setEditingSessao] = useState<(SessaoInputs & { id: string }) | null>(null)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")

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
            } else {
                formData.append(key, value as string)
            }
        })
        result = await createSessao(slug, null, formData)
      }

      if (result.success) {
        setIsModalOpen(false)
        setEditingSessao(null)
        router.refresh()
      } else {
        alert(result.error || "Ocorreu um erro")
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta sessão?")) return

    startTransition(async () => {
      const result = await deleteSessao(slug, id)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error)
      }
    })
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
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
    switch (status) {
      case "agendada": return "Agendada"
      case "aberta": return "Aberta"
      case "encerrada": return "Encerrada"
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberta": return "bg-green-500/10 text-green-500 border-green-500/20"
      case "encerrada": return "bg-zinc-500/10 text-zinc-400 border-zinc-700/50"
      case "agendada": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-700/50"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Sessões</h2>
          <p className="text-zinc-400">Gerencie as sessões e pautas legislativas.</p>
        </div>
        <Button 
          onClick={() => {
            setEditingSessao(null)
            setIsModalOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-blue-500/50"
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Sessão
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-[2]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                  placeholder="Buscar pelo título..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-900/50 border-zinc-800 text-white focus:border-blue-500/30 w-full"
              />
          </div>
          <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                  type="date"
                  value={searchParams.get("data") || ""}
                  onChange={(e) => {
                      const params = new URLSearchParams(searchParams.toString())
                      if (e.target.value) {
                          params.set("data", e.target.value)
                      } else {
                          params.delete("data")
                      }
                      params.set("page", "1")
                      router.push(`?${params.toString()}`)
                  }}
                  className="pl-10 bg-zinc-900/50 border-zinc-800 text-white focus:border-blue-500/30 w-full"
              />
          </div>
          <Button type="submit" variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white">
              Filtrar
          </Button>
          {searchParams.get("data") && (
              <Button 
                type="button"
                variant="ghost" 
                onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete("data")
                    router.push(`?${params.toString()}`)
                }}
                className="text-zinc-500 hover:text-white"
              >
                  Limpar Data
              </Button>
          )}
      </form>

      <div className="grid gap-4">
        {sessoes.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-zinc-800 text-zinc-500">
            Nenhuma sessão encontrada.
          </div>
        ) : (
          sessoes.map((sessao) => {
            const date = new Date(sessao.iniciou_em)
            return (
              <div key={sessao.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl hover:bg-zinc-900/80 transition-colors group">
                <div className="flex gap-4 items-start">
                  <div className="h-12 w-12 rounded-lg bg-zinc-800 flex flex-shrink-0 items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-lg">{sessao.titulo}</h3>
                      <Badge variant="outline" className={getStatusColor(sessao.status)}>
                        {formatStatus(sessao.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {date.toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-1.5 capitalize">
                            <ListFilter className="h-3.5 w-3.5" />
                            {sessao.tipo}
                        </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto transition-all">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="bg-zinc-800/50 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    title="Editar Sessão"
                    onClick={() => {
                        const date = new Date(sessao.iniciou_em)
                        setEditingSessao({
                            id: sessao.id,
                            titulo: sessao.titulo,
                            tipo: sessao.tipo as SessaoInputs["tipo"],
                            status: sessao.status as SessaoInputs["status"],
                            data: date.toISOString().split('T')[0],
                            hora: date.toISOString().split('T')[1].substring(0, 5),
                            projeto_ids: sessao.pauta_itens?.map((item: { projeto_id: string }) => item.projeto_id) || []
                        })
                        setIsModalOpen(true)
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="bg-zinc-800/50 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                    onClick={() => handleDelete(sessao.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <SessaoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        availableProjects={availableProjects}
        busyProjects={busyProjects}
        editingSessao={editingSessao}
        isPending={isPending}
      />
    </div>
  )
}
