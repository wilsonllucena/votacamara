"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit2, UserX, Power, User } from "lucide-react"
import { CouncilorModal } from "./CouncilorModal"
import { toggleVereadorStatus, updateVereador, createVereador } from "@/app/admin/_actions/vereadores"

interface CouncilorsClientProps {
  councilors: any[]
  slug: string
}

export function CouncilorsClient({ councilors, slug }: CouncilorsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCouncilor, setEditingCouncilor] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

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
        alert(result.error)
      } else if (result?.success) {
        setIsModalOpen(false)
        setEditingCouncilor(null)
        router.refresh()
      } else {
        // Fallback for success if result is empty or different
        setIsModalOpen(false)
        setEditingCouncilor(null)
        router.refresh()
      }
    })
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'desativar' : 'ativar'
    if (confirm(`Tem certeza que deseja ${action} este vereador?`)) {
      startTransition(async () => {
        await toggleVereadorStatus(slug, id, currentStatus)
        router.refresh()
      })
    }
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
       {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Vereadores</h2>
            <p className="text-muted-foreground">Gerencie os parlamentares da legislatura atual.</p>
         </div>
         <Button 
            onClick={() => {
              setEditingCouncilor(null)
              setIsModalOpen(true)
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm border border-primary/50"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Vereador
         </Button>
      </div>

      {/* Filters */}
        <form onSubmit={handleSearch} className="flex items-center gap-4 bg-card/50 p-4 rounded-xl border border-border">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                    type="text" 
                    placeholder="Buscar por nome..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
            </div>
            <Button type="submit" variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-muted hidden sm:flex">
                Buscar
            </Button>
        </form>

      {/* List */}
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
                                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-primary">
                                      <User className="h-5 w-5" />
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
                                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                  >
                                      <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => handleToggleStatus(vereador.id, vereador.ativo)}
                                    className={`p-2 transition-colors ${vereador.ativo ? 'text-muted-foreground hover:text-red-400' : 'text-muted-foreground hover:text-green-400'}`}
                                    title={vereador.ativo ? "Desativar" : "Ativar"}
                                  >
                                      {vereador.ativo ? <UserX className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                  </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {councilors.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                          Nenhum vereador encontrado.
                        </td>
                      </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      <CouncilorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        editingCouncilor={editingCouncilor}
        isPending={isPending}
      />
    </div>
  )
}
