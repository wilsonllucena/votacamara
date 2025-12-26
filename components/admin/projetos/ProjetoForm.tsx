"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, Sparkles, FileText, Check } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useState } from "react"
import { summarizeProject } from "@/app/admin/_actions/projetos"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { STORAGE_BUCKETS } from "@/config/storage"

const projetoSchema = z.object({
  numero: z.string().min(1, "Número é obrigatório"),
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  ementa: z.string().min(10, "Ementa deve ser detalhada"),
  autor: z.string().min(2, "Autor é obrigatório"),
  autor_id: z.string().uuid("Vereador selecionado inválido").optional().or(z.literal("")),
  texto_url: z.string().url("URL do texto deve ser válida").optional().or(z.literal("")),
  status: z.enum(["Rascunho", "Em Pauta", "Votado"]),
})

export type ProjetoInputs = z.infer<typeof projetoSchema>

interface ProjetoFormProps {
  defaultValues?: Partial<ProjetoInputs>
  onSubmit: (data: ProjetoInputs) => void
  onCancel: () => void
  isPending?: boolean
  vereadores: { id: string, nome: string }[]
}

export function ProjetoForm({ defaultValues, onSubmit, onCancel, isPending, vereadores }: ProjetoFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjetoInputs>({
    resolver: zodResolver(projetoSchema),
    defaultValues: {
      numero: defaultValues?.numero || "",
      titulo: defaultValues?.titulo || "",
      ementa: defaultValues?.ementa || "",
      autor: defaultValues?.autor || "",
      autor_id: defaultValues?.autor_id || "",
      texto_url: defaultValues?.texto_url || "",
      status: (defaultValues?.status as ProjetoInputs["status"]) || "Rascunho",
    }
  })

  const [isUploading, setIsUploading] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const supabase = createClient()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // 1. Apagar arquivo antigo se existir
      const currentUrl = watch("texto_url")
      if (currentUrl && currentUrl.includes(STORAGE_BUCKETS.PROJETOS)) {
        try {
          const oldFileName = currentUrl.split('/').pop()
          if (oldFileName) {
            await supabase.storage
              .from(STORAGE_BUCKETS.PROJETOS)
              .remove([oldFileName])
          }
        } catch (err) {
          console.error("Erro ao remover arquivo antigo:", err)
        }
      }

      // 2. Fazer upload do novo arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.PROJETOS)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKETS.PROJETOS)
        .getPublicUrl(filePath)

      setValue("texto_url", publicUrl)
    } catch (error: any) {
      alert("Erro no upload: " + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSummarize = async (url?: string) => {
    const targetUrl = url || watch("texto_url")
    if (!targetUrl) return

    setIsSummarizing(true)
    try {
      const result = await summarizeProject(targetUrl) as any
      if (result.success) {
        if (result.summary) setValue("ementa", result.summary)
        if (result.title) setValue("titulo", result.title)
      } else if (result.error) {
        alert("Erro na IA: " + result.error)
      }
    } catch (error: any) {
      alert("Erro ao processar resumo: " + error.message)
    } finally {
      setIsSummarizing(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2 col-span-1">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="numero">Número</label>
            <input 
              {...register("numero")}
              id="numero"
              type="text" 
              className={`w-full bg-background border ${errors.numero ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
              placeholder="Ex: 001/2024"
            />
            {errors.numero && <p className="text-xs text-red-500 mt-1">{errors.numero.message}</p>}
        </div>

        <div className="space-y-2 col-span-3">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="titulo">Título Curto</label>
            <input 
              {...register("titulo")}
              id="titulo"
              type="text" 
              className={`w-full bg-background border ${errors.titulo ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
              placeholder="Ex: Projeto de Lei da Saúde"
            />
            {errors.titulo && <p className="text-xs text-red-500 mt-1">{errors.titulo.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="ementa">Ementa Completa</label>
        <textarea 
          {...register("ementa")}
          id="ementa"
          rows={4}
          className={`w-full bg-background border ${errors.ementa ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none`}
          placeholder="Descreva o projeto detalhadamente..."
        />
        {errors.ementa && <p className="text-xs text-red-500 mt-1">{errors.ementa.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="autor_id">Autor (Vereador)</label>
            <select 
              {...register("autor_id")}
              id="autor_id"
              className={`w-full bg-background border ${errors.autor_id ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
              onChange={(e) => {
                const selected = vereadores.find(v => v.id === e.target.value)
                if (selected) {
                    setValue("autor", selected.nome)
                }
              }}
            >
              <option value="">Selecione um Vereador</option>
              {vereadores.map(v => (
                <option key={v.id} value={v.id}>{v.nome}</option>
              ))}
            </select>
            <input type="hidden" {...register("autor")} />
            {errors.autor_id && <p className="text-xs text-red-500 mt-1">{errors.autor_id.message}</p>}
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="status">Status</label>
            <select 
              {...register("status")}
              id="status"
              className={`w-full bg-background border ${errors.status ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
            >
              <option value="Rascunho">Rascunho</option>
              <option value="Em Pauta">Em Pauta</option>
              <option value="Votado">Votado</option>
            </select>
            {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
        </div>
      </div>

      <div className="space-y-4 p-4 border border-dashed border-border rounded-xl bg-muted/30">
        <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Documento do Projeto (PDF)
            </label>
            {watch("texto_url") && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                    <Check className="w-3 h-3" /> Enviado
                </Badge>
            )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <input 
                    type="file" 
                    id="file-upload"
                    className="hidden" 
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                />
                <label 
                    htmlFor="file-upload"
                    className={cn(
                        "flex items-center justify-center gap-2 w-full h-11 bg-background border border-border rounded-lg px-4 cursor-pointer hover:bg-muted transition-all text-sm font-medium",
                        isUploading && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {watch("texto_url") ? "Alterar Arquivo" : "Selecionar PDF"}
                </label>
            </div>

            <Button 
                type="button"
                variant="outline"
                className="h-11 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 gap-2 font-bold"
                onClick={() => handleSummarize()}
                disabled={isSummarizing || !watch("texto_url")}
            >
                {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Resumir com IA
            </Button>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider" htmlFor="texto_url">URL do Documento</label>
            <input 
                {...register("texto_url")}
                id="texto_url"
                type="text" 
                className={`w-full bg-background border ${errors.texto_url ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all`}
                placeholder="https://supabase.com/..."
                readOnly
            />
            {errors.texto_url && <p className="text-xs text-red-500 mt-1">{errors.texto_url.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-border text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
