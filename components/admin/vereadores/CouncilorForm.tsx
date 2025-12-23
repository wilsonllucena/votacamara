"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const councilorSchema = z.object({
  nome: z.string().min(3, "Mínimo 3 caracteres"),
  partido: z.string().min(1, "Partido é obrigatório"),
  cpf: z.string().min(1, "CPF é obrigatório").transform(v => v.replace(/\D/g, "")).pipe(z.string().length(11, "CPF deve ter 11 dígitos")),
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  telefone: z.string().min(1, "Telefone é obrigatório").transform(v => v.replace(/\D/g, "")).pipe(z.string().min(10, "Mínimo 10 dígitos").max(11, "Máximo 11 dígitos")),
  ativo: z.boolean(),
  isPresidente: z.boolean(),
})

export type CouncilorInputs = z.infer<typeof councilorSchema>

interface CouncilorFormProps {
  defaultValues?: Partial<CouncilorInputs>
  onSubmit: (data: CouncilorInputs) => void
  onCancel: () => void
  isPending?: boolean
}

export function CouncilorForm({ defaultValues, onSubmit, onCancel, isPending }: CouncilorFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CouncilorInputs>({
    resolver: zodResolver(councilorSchema),
    defaultValues: {
      nome: defaultValues?.nome || "",
      partido: defaultValues?.partido || "",
      cpf: defaultValues?.cpf || "",
      email: defaultValues?.email || "",
      telefone: defaultValues?.telefone || "",
      ativo: defaultValues?.ativo ?? true,
      isPresidente: defaultValues?.isPresidente ?? false,
    }
  })

  const [cpfDisplay, setCpfDisplay] = useState(defaultValues?.cpf || "")
  const [telefoneDisplay, setTelefoneDisplay] = useState(defaultValues?.telefone || "")

  const maskCpf = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  const maskTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 14)
    } else {
      return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .slice(0, 15)
    }
  }

  const handleFormSubmit = async (data: CouncilorInputs) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="nome">Nome Completo</label>
        <input 
          {...register("nome")}
          id="nome"
          type="text" 
          className={`w-full bg-background border ${errors.nome ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
          placeholder="Ex: João Silva"
        />
        {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="partido">Partido</label>
          <input 
            {...register("partido")}
            id="partido"
            type="text" 
            className={`w-full bg-background border ${errors.partido ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
            placeholder="Ex: PSD"
          />
          {errors.partido && <p className="text-xs text-red-500 mt-1">{errors.partido.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="cpf">CPF</label>
          <input 
            id="cpf"
            type="text" 
            value={cpfDisplay}
            onChange={(e) => {
              const masked = maskCpf(e.target.value)
              setCpfDisplay(masked)
              setValue("cpf", masked, { shouldValidate: true })
            }}
            className={`w-full bg-background border ${errors.cpf ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
            placeholder="000.000.000-00"
          />
          {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="email">Email</label>
        <input 
          {...register("email")}
          id="email"
          type="email" 
          className={`w-full bg-background border ${errors.email ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
          placeholder="joao@camara.leg.br"
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="telefone">Telefone</label>
        <input 
          id="telefone"
          type="text" 
          value={telefoneDisplay}
          onChange={(e) => {
            const masked = maskTelefone(e.target.value)
            setTelefoneDisplay(masked)
            setValue("telefone", masked, { shouldValidate: true })
          }}
          className={`w-full bg-background border ${errors.telefone ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
          placeholder="(00) 00000-0000"
        />
        {errors.telefone && <p className="text-xs text-red-500 mt-1">{errors.telefone.message}</p>}
      </div>

      <div className="flex flex-col gap-4 py-2">
        <div className="flex items-center space-x-2">
          <input
            {...register("ativo")}
            id="ativo"
            type="checkbox"
            className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/50"
          />
          <label htmlFor="ativo" className="text-sm font-medium text-muted-foreground cursor-pointer">
            Vereador Ativo
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            {...register("isPresidente")}
            id="isPresidente"
            type="checkbox"
            className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/50"
          />
          <label htmlFor="isPresidente" className="group flex items-center gap-2 text-sm font-medium text-muted-foreground cursor-pointer">
            Presidente da Câmara
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 group-hover:bg-primary/20 transition-colors uppercase font-bold tracking-wider">Presidente</span>
          </label>
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
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm border border-primary/50 min-w-[120px]"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
