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
  texto_url: z.string().url("URL do texto deve ser válida").optional().or(z.literal("")),
  status: z.enum(["Rascunho", "Em Pauta", "Votado"]),
})

export type ProjetoInputs = z.infer<typeof projetoSchema>

interface ProjetoFormProps {
  defaultValues?: Partial<ProjetoInputs>
  onSubmit: (data: ProjetoInputs) => void
  onCancel: () => void
  isPending?: boolean
}

export function ProjetoForm({ defaultValues, onSubmit, onCancel, isPending }: ProjetoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjetoInputs>({
    resolver: zodResolver(projetoSchema),
    defaultValues: {
      numero: defaultValues?.numero || "",
      titulo: defaultValues?.titulo || "",
      ementa: defaultValues?.ementa || "",
      autor: defaultValues?.autor || "",
      texto_url: defaultValues?.texto_url || "",
      status: (defaultValues?.status as ProjetoInputs["status"]) || "Rascunho",
    }
  })
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2 col-span-1">
            <label className="text-sm font-medium text-zinc-300" htmlFor="numero">Número</label>
            <input 
              {...register("numero")}
              id="numero"
              type="text" 
              className={`w-full bg-zinc-900 border ${errors.numero ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
              placeholder="Ex: 001/2024"
            />
            {errors.numero && <p className="text-xs text-red-500 mt-1">{errors.numero.message}</p>}
        </div>

        <div className="space-y-2 col-span-3">
            <label className="text-sm font-medium text-zinc-300" htmlFor="titulo">Título Curto</label>
            <input 
              {...register("titulo")}
              id="titulo"
              type="text" 
              className={`w-full bg-zinc-900 border ${errors.titulo ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
              placeholder="Ex: Projeto de Lei da Saúde"
            />
            {errors.titulo && <p className="text-xs text-red-500 mt-1">{errors.titulo.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300" htmlFor="ementa">Ementa Completa</label>
        <textarea 
          {...register("ementa")}
          id="ementa"
          rows={4}
          className={`w-full bg-zinc-900 border ${errors.ementa ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none`}
          placeholder="Descreva o projeto detalhadamente..."
        />
        {errors.ementa && <p className="text-xs text-red-500 mt-1">{errors.ementa.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300" htmlFor="autor">Autor</label>
            <input 
              {...register("autor")}
              id="autor"
              type="text" 
              className={`w-full bg-zinc-900 border ${errors.autor ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
              placeholder="Ex: Vereador João Silva ou Executivo"
            />
            {errors.autor && <p className="text-xs text-red-500 mt-1">{errors.autor.message}</p>}
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300" htmlFor="status">Status</label>
            <select 
              {...register("status")}
              id="status"
              className={`w-full bg-zinc-900 border ${errors.status ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
            >
              <option value="Rascunho">Rascunho</option>
              <option value="Em Pauta">Em Pauta</option>
              <option value="Votado">Votado</option>
            </select>
            {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300" htmlFor="texto_url">Link para Texto Integral (URL)</label>
        <input 
          {...register("texto_url")}
          id="texto_url"
          type="text" 
          className={`w-full bg-zinc-900 border ${errors.texto_url ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
          placeholder="https://example.com/projeto.pdf"
        />
        {errors.texto_url && <p className="text-xs text-red-500 mt-1">{errors.texto_url.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-blue-500/50 min-w-[120px]"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
