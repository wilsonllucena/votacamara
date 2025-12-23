"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

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

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="texto_url">Link para Texto Integral (URL)</label>
        <input 
          {...register("texto_url")}
          id="texto_url"
          type="text" 
          className={`w-full bg-background border ${errors.texto_url ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
          placeholder="https://example.com/projeto.pdf"
        />
        {errors.texto_url && <p className="text-xs text-red-500 mt-1">{errors.texto_url.message}</p>}
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
