"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const cargoSchema = z.object({
  nome: z.string().min(2, "Mínimo 2 caracteres"),
  descricao: z.string().optional().or(z.literal("")),
})

export type CargoInputs = z.infer<typeof cargoSchema>

interface CargoFormProps {
  defaultValues?: Partial<CargoInputs>
  onSubmit: (data: CargoInputs) => void
  onCancel: () => void
  isPending?: boolean
}

export function CargoForm({ defaultValues, onSubmit, onCancel, isPending }: CargoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CargoInputs>({
    resolver: zodResolver(cargoSchema),
    defaultValues: {
      nome: defaultValues?.nome || "",
      descricao: defaultValues?.descricao || "",
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="nome">
          Nome do Cargo
        </label>
        <input 
          {...register("nome")}
          id="nome"
          type="text" 
          className={`w-full bg-background border ${errors.nome ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
          placeholder="Ex: Presidente, Secretário, etc."
        />
        {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="descricao">
          Descrição (Opcional)
        </label>
        <textarea 
          {...register("descricao")}
          id="descricao"
          rows={3}
          className={`w-full bg-background border ${errors.descricao ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none`}
          placeholder="Uma breve descrição sobre as responsabilidades deste cargo."
        />
        {errors.descricao && <p className="text-xs text-red-500 mt-1">{errors.descricao.message}</p>}
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
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm border border-primary/50 min-w-[120px]"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
