"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const mesaMemberSchema = z.object({
  cargo_id: z.string().min(1, "O cargo é obrigatório"),
  vereador_id: z.string().min(1, "O vereador é obrigatório"),
})

export type MesaMemberInputs = z.infer<typeof mesaMemberSchema>

interface MesaDiretoraFormProps {
  defaultValues?: Partial<MesaMemberInputs>
  cargos: any[]
  vereadores: any[]
  onSubmit: (data: MesaMemberInputs) => void
  onCancel: () => void
  isPending?: boolean
}

export function MesaDiretoraForm({ defaultValues, cargos, vereadores, onSubmit, onCancel, isPending }: MesaDiretoraFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MesaMemberInputs>({
    resolver: zodResolver(mesaMemberSchema),
    defaultValues: {
      cargo_id: defaultValues?.cargo_id || "",
      vereador_id: defaultValues?.vereador_id || "",
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="cargo_id">
          Cargo
        </label>
        <select 
          {...register("cargo_id")}
          id="cargo_id"
          className={`w-full bg-background border ${errors.cargo_id ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
        >
          <option value="">Selecione um cargo...</option>
          {cargos.map(cargo => (
            <option key={cargo.id} value={cargo.id}>{cargo.nome}</option>
          ))}
        </select>
        {errors.cargo_id && <p className="text-xs text-red-500 mt-1">{errors.cargo_id.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="vereador_id">
          Parlamentar
        </label>
        <select 
          {...register("vereador_id")}
          id="vereador_id"
          className={`w-full bg-background border ${errors.vereador_id ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
        >
          <option value="">Selecione um parlamentar...</option>
          {vereadores.map(v => (
            <option key={v.id} value={v.id}>{v.nome} ({v.partido})</option>
          ))}
        </select>
        {errors.vereador_id && <p className="text-xs text-red-500 mt-1">{errors.vereador_id.message}</p>}
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
