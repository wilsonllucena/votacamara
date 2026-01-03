"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus, 
  List, 
  Edit2, 
  Trash2, 
  Search,
  Activity,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { createSituacao, updateSituacao, deleteSituacao } from "@/app/admin/_actions/situacoes"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Pagination } from "@/components/admin/Pagination"
import { useSearchParams } from "next/navigation"

const situacaoSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  label: z.string().min(2, "O label deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional().or(z.literal("")),
})

type SituacaoInputs = z.infer<typeof situacaoSchema>

interface Situacao {
  id: string
  nome: string
  label: string
  descricao: string | null
  created_at: string
}

interface SituacoesClientProps {
  slug: string
  situacoes: Situacao[]
  pagination: {
    currentPage: number
    totalPages: number
  }
}

export function SituacoesClient({ slug, situacoes, pagination }: SituacoesClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("list")
  const [editingSituacao, setEditingSituacao] = useState<Situacao | null>(null)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [situacaoToDelete, setSituacaoToDelete] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Sync search term with URL
  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm) {
      params.set("search", searchTerm)
    } else {
      params.delete("search")
    }
    params.set("page", "1") // Reset to page 1 on new search
    router.push(`?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SituacaoInputs>({
    resolver: zodResolver(situacaoSchema),
    defaultValues: {
      nome: "",
      label: "",
      descricao: "",
    }
  })

  // Watch for changes in 'nome' to auto-generate 'label'
  const nomeValue = watch("nome")

  const generateLabel = (text: string) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/ç/gi, 'c') // Ç -> C
      .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special chars
      .trim()
      .replace(/\s+/g, "_") // Spaces to underscores
      .toUpperCase()
  }

  // Effect to sync label with nome
  useEffect(() => {
    if (nomeValue && !editingSituacao) {
      setValue("label", generateLabel(nomeValue))
    }
  }, [nomeValue, setValue, editingSituacao])

  const handleEdit = (situacao: Situacao) => {
    setEditingSituacao(situacao)
    reset({
      nome: situacao.nome,
      label: situacao.label,
      descricao: situacao.descricao || "",
    })
    setActiveTab("form")
  }

  const onSubmit = async (data: SituacaoInputs) => {
    startTransition(async () => {
      let result
      if (editingSituacao) {
        result = await updateSituacao(slug, editingSituacao.id, data)
      } else {
        const formData = new FormData()
        formData.append("nome", data.nome)
        formData.append("label", data.label)
        formData.append("descricao", data.descricao || "")
        result = await createSituacao(slug, null, formData)
      }

      if (result.success) {
        setMessage({ type: 'success', text: editingSituacao ? "Situação atualizada!" : "Situação criada!" })
        setEditingSituacao(null)
        reset()
        setActiveTab("list")
        router.refresh()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || "Erro ao salvar" })
      }
    })
  }

  const handleDelete = async () => {
    if (!situacaoToDelete) return
    
    startTransition(async () => {
      const result = await deleteSituacao(slug, situacaoToDelete)
      if (result.success) {
        setMessage({ type: 'success', text: "Situação excluída!" })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || "Erro ao excluir" })
      }
      setIsDeleteDialogOpen(false)
      setSituacaoToDelete(null)
      setTimeout(() => setMessage(null), 4000)
    })
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Situações de Matérias</h1>
          <p className="text-muted-foreground text-sm">Gerencie os possíveis estados de tramitação dos projetos legislativos.</p>
        </div>
      </div>

      {message && (
        <div className={cn(
          "flex items-center gap-2 p-4 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300",
          message.type === 'success' ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
        )}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v)
        if (v === "list") {
            setEditingSituacao(null)
            reset({ nome: "", descricao: "" })
        }
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Listar Situações
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {editingSituacao ? "Editar Situação" : "Nova Situação"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar por nome ou label..."
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              />
            </div>
            <Button onClick={handleSearch} variant="secondary" className="md:w-32">
                Buscar
            </Button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Situação (Exibição)</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Label (Sistema)</th>
                    <th className="px-6 py-4 font-bold tracking-wider hidden md:table-cell">Descrição</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {situacoes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                        Nenhuma situação encontrada.
                      </td>
                    </tr>
                  ) : (
                    situacoes.map((sit) => (
                      <tr key={sit.id} className="hover:bg-muted/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-foreground">
                          <div className="flex items-center gap-2">
                             <CheckCircle2 className="w-4 h-4 text-green-500/60" />
                             {sit.nome}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-primary bg-primary/5 rounded-md mx-2 my-1 inline-block">
                           {sit.label}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden md:table-cell max-w-xs truncate">
                          {sit.descricao || "Sem descrição"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(sit)}
                              className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-md"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setSituacaoToDelete(sit.id)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="p-2 text-muted-foreground hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-md"
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
          </div>

          <Pagination 
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
          />
        </TabsContent>

        <TabsContent value="form" className="animate-in slide-in-from-right-4 duration-500">
          <div className="max-w-2xl bg-card border border-border rounded-xl shadow-sm p-8">
             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Nome Amigável (Exibição)
                  </label>
                  <Input 
                    {...register("nome")}
                    placeholder="Ex: Em Tramitação, Aprovada..."
                    className="h-11 font-medium bg-muted/20"
                  />
                  {errors.nome && <p className="text-xs text-red-500 font-medium">{errors.nome.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Label do Sistema (Gerado Automaticamente)
                  </label>
                  <Input 
                    {...register("label")}
                    placeholder="Gerado automaticamente..."
                    className="h-11 font-mono uppercase bg-muted/20 cursor-not-allowed opacity-80"
                    readOnly
                  />
                  <p className="text-[10px] text-muted-foreground italic">Este valor é usado internamente e não pode ser editado manualmente.</p>
                  {errors.label && <p className="text-xs text-red-500 font-medium">{errors.label.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <List className="w-4 h-4 text-primary" />
                    Descrição (Opcional)
                  </label>
                  <Textarea 
                    {...register("descricao")}
                    placeholder="Descreva o que este status representa..."
                    className="min-h-[120px] bg-muted/20 resize-none"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                   <Button 
                    type="submit" 
                    disabled={isPending}
                    className="flex-1 h-11 font-bold disabled:opacity-50"
                   >
                     {isPending ? "Salvando..." : editingSituacao ? "Salvar Alterações" : "Criar Situação"}
                   </Button>
                   <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab("list")}
                    className="h-11 px-8 font-bold"
                   >
                     Cancelar
                   </Button>
                </div>
             </form>
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Situação"
        description="Tem certeza que deseja excluir esta situação? Esta ação não poderá ser desfeita se não houver matérias vinculadas."
      />
    </div>
  )
}
