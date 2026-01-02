"use client"

import { useState, useTransition } from "react"
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
  Tag,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { createCategoria, updateCategoria, deleteCategoria } from "@/app/admin/_actions/categorias"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const categoriaSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional().or(z.literal("")),
})

type CategoriaInputs = z.infer<typeof categoriaSchema>

interface Categoria {
  id: string
  nome: string
  descricao: string | null
  created_at: string
}

interface CategoriasClientProps {
  slug: string
  categorias: Categoria[]
}

export function CategoriasClient({ slug, categorias }: CategoriasClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("list")
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoriaToDelete, setCategoriaToDelete] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoriaInputs>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome: "",
      descricao: "",
    }
  })

  // Sincronizar form ao editar
  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria)
    reset({
      nome: categoria.nome,
      descricao: categoria.descricao || "",
    })
    setActiveTab("form")
  }

  const onSubmit = async (data: CategoriaInputs) => {
    startTransition(async () => {
      let result
      if (editingCategoria) {
        result = await updateCategoria(slug, editingCategoria.id, data)
      } else {
        const formData = new FormData()
        formData.append("nome", data.nome)
        formData.append("descricao", data.descricao || "")
        result = await createCategoria(slug, null, formData)
      }

      if (result.success) {
        setMessage({ type: 'success', text: editingCategoria ? "Categoria atualizada!" : "Categoria criada!" })
        setEditingCategoria(null)
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
    if (!categoriaToDelete) return
    
    startTransition(async () => {
      const result = await deleteCategoria(slug, categoriaToDelete)
      if (result.success) {
        setMessage({ type: 'success', text: "Categoria excluída!" })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || "Erro ao excluir" })
      }
      setIsDeleteDialogOpen(false)
      setCategoriaToDelete(null)
      setTimeout(() => setMessage(null), 4000)
    })
  }

  const filteredCategorias = categorias.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Categorias</h1>
          <p className="text-muted-foreground text-sm">Organize suas matérias legislativas por temas específicos.</p>
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
            setEditingCategoria(null)
            reset({ nome: "", descricao: "" })
        }
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Listar Categorias
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {editingCategoria ? "Editar Categoria" : "Nova Categoria"}
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
                placeholder="Buscar por nome..."
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Nome</th>
                    <th className="px-6 py-4 font-bold tracking-wider hidden md:table-cell">Descrição</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCategorias.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground italic">
                        Nenhuma categoria encontrada.
                      </td>
                    </tr>
                  ) : (
                    filteredCategorias.map((cat) => (
                      <tr key={cat.id} className="hover:bg-muted/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-foreground">
                          <div className="flex items-center gap-2">
                             <Tag className="w-4 h-4 text-primary/60" />
                             {cat.nome}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden md:table-cell max-w-xs truncate">
                          {cat.descricao || "Sem descrição"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(cat)}
                              className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-md"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setCategoriaToDelete(cat.id)
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
        </TabsContent>

        <TabsContent value="form" className="animate-in slide-in-from-right-4 duration-500">
          <div className="max-w-2xl bg-card border border-border rounded-xl shadow-sm p-8">
             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    Nome da Categoria
                  </label>
                  <Input 
                    {...register("nome")}
                    placeholder="Ex: EDUCAÇÃO, SAÚDE, etc."
                    className="h-11 font-medium bg-muted/20"
                  />
                  {errors.nome && <p className="text-xs text-red-500 font-medium">{errors.nome.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <List className="w-4 h-4 text-primary" />
                    Descrição (Opcional)
                  </label>
                  <Textarea 
                    {...register("descricao")}
                    placeholder="Descreva a finalidade desta categoria..."
                    className="min-h-[120px] bg-muted/20 resize-none"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                   <Button 
                    type="submit" 
                    disabled={isPending}
                    className="flex-1 h-11 font-bold disabled:opacity-50"
                   >
                     {isPending ? "Salvando..." : editingCategoria ? "Salvar Alterações" : "Criar Categoria"}
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
        title="Excluir Categoria"
        description="Tem certeza que deseja excluir esta categoria? Esta ação não poderá ser desfeita se não houver matérias vinculadas."
      />
    </div>
  )
}
