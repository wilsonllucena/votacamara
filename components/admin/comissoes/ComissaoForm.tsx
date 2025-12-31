"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Users, 
  FileText, 
  Plus, 
  Trash2, 
  UserCheck, 
  Crown, 
  BookOpen, 
  X,
  ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

const comissaoSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  tipo: z.string().min(1, "Selecione o tipo da comissão"),
  descricao: z.string().optional(),
  membros: z.array(z.object({
    vereador_id: z.string().min(1, "Selecione um vereador"),
    cargo: z.string().min(1, "Selecione um cargo na comissão"),
  })).min(1, "A comissão deve ter pelo menos um membro"),
  materias: z.array(z.object({
    materia_id: z.string().min(1, "Selecione uma matéria"),
  })),
})

type ComissaoInputs = z.infer<typeof comissaoSchema>

interface ComissaoFormProps {
  vereadores: any[]
  materias: any[]
  onSuccess: (data: any) => void
}

export function ComissaoForm({ vereadores, materias, onSuccess }: ComissaoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ComissaoInputs>({
    resolver: zodResolver(comissaoSchema),
    defaultValues: {
      nome: "",
      tipo: "Permanente",
      descricao: "",
      membros: [{ vereador_id: "", cargo: "Membro" }],
      materias: [],
    }
  })

  const { fields: membroFields, append: appendMembro, remove: removeMembro } = useFieldArray({
    control,
    name: "membros",
  })

  const { fields: materiaFields, append: appendMateria, remove: removeMateria } = useFieldArray({
    control,
    name: "materias",
  })

  const onSubmit = (data: ComissaoInputs) => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      onSuccess(data)
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
           <BadgeInfo className="w-5 h-5 text-primary" />
           Informações da Comissão
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground">Nome da Comissão</label>
            <Input {...register("nome")} placeholder="Ex: Comissão de Justiça" className="bg-background" />
            {errors.nome && <p className="text-xs text-red-500 font-medium">{errors.nome.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground">Tipo</label>
            <select 
              {...register("tipo")} 
              className="w-full h-11 bg-background border border-border rounded-lg px-3 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
            >
              <option value="Permanente">Permanente</option>
              <option value="Temporária">Temporária (Especial)</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-muted-foreground">Descrição / Objetivo</label>
          <Textarea 
            {...register("descricao")} 
            placeholder="Descreva brevemente a finalidade desta comissão..." 
            className="bg-background min-h-[100px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seleção de Membros */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Membros da Comissão
            </h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => appendMembro({ vereador_id: "", cargo: "Membro" })}
              className="text-primary border-primary/20 hover:bg-primary/5 font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Adicionar
            </Button>
          </div>
          
          <div className="space-y-3">
            {membroFields.map((field, index) => {
              const selectedVereadorId = watch(`membros.${index}.vereador_id`)
              const selectedVereador = vereadores.find(v => v.id === selectedVereadorId)

              return (
                <div key={field.id} className="group relative flex flex-col sm:flex-row gap-3 p-4 bg-muted/30 border border-border rounded-xl hover:border-primary/30 transition-all">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Vereador</label>
                    <div className="relative">
                      <select 
                        {...register(`membros.${index}.vereador_id` as const)}
                        className="w-full h-10 bg-background border border-border rounded-lg px-3 text-xs focus:ring-1 focus:ring-primary transition-all outline-none appearance-none"
                      >
                        <option value="">Selecione um vereador...</option>
                        {vereadores.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.nome} {v.isMesa ? `(${v.cargoMesa})` : `(${v.partido})`}
                          </option>
                        ))}
                      </select>
                      {selectedVereador?.isMesa && (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2">
                          <Crown className="w-3.5 h-3.5 text-amber-500" title="Membro da Mesa Diretora" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full sm:w-[150px] space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Cargo na Comiss.</label>
                    <select 
                      {...register(`membros.${index}.cargo` as const)}
                      className="w-full h-10 bg-background border border-border rounded-lg px-3 text-xs focus:ring-1 focus:ring-primary transition-all outline-none"
                    >
                      <option value="Presidente">Presidente</option>
                      <option value="Relator">Relator</option>
                      <option value="Membro">Membro</option>
                      <option value="Suplente">Suplente</option>
                    </select>
                  </div>

                  {membroFields.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeMembro(index)}
                      className="absolute -right-2 -top-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )
            })}
            {errors.membros && <p className="text-xs text-red-500 font-medium">{errors.membros.message}</p>}
          </div>
        </div>

        {/* Seleção de Matérias */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Matérias Vinculadas
            </h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => appendMateria({ materia_id: "" })}
              className="text-primary border-primary/20 hover:bg-primary/5 font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Vincular
            </Button>
          </div>

          {materiaFields.length === 0 ? (
            <div className="h-[120px] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center p-4">
              <FileText className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground italic">Nenhuma matéria vinculada. Adicione matérias para análise desta comissão.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {materiaFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <div className="flex-1 relative">
                    <select 
                      {...register(`materias.${index}.materia_id` as const)}
                      className="w-full h-11 bg-background border border-border rounded-lg px-4 text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="">Buscar projeto...</option>
                      {materias.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.numero} - {m.titulo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeMateria(index)}
                    className="text-red-500 hover:bg-red-500/10 h-11 w-11"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
             <ShieldCheck className="w-4 h-4 text-green-500" />
             <span className="text-xs">Todos os dados serão salvos como rascunho oficial.</span>
          </div>
          <Button type="submit" disabled={isSubmitting} className="px-10 font-bold bg-primary hover:bg-primary/90">
            {isSubmitting ? "Gravando..." : "Salvar Comissão"}
          </Button>
      </div>
    </form>
  )
}

function BadgeInfo(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}
