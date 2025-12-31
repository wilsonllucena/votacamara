"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, Camera, X } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { cn, maskCpf, maskTelefone } from "@/lib/utils"

const councilorSchema = z.object({
  nome: z.string().min(3, "Mínimo 3 caracteres"),
  partido: z.string().optional().or(z.literal("")),
  cpf: z.string().optional().or(z.literal("")),
  email: z.string().optional().or(z.literal("")),
  telefone: z.string().optional().or(z.literal("")),
  ativo: z.boolean(),
  isPresidente: z.boolean(),
  isExecutivo: z.boolean(),
  foto_url: z.string().url("URL inválida").optional().or(z.literal("")),
  data_inicio: z.string().optional().or(z.literal("")),
  data_fim: z.string().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  if (!data.isExecutivo) {
    if (!data.partido) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Partido é obrigatório", path: ["partido"] });
    }
    if (!data.cpf || data.cpf.replace(/\D/g, "").length !== 11) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CPF inválido", path: ["cpf"] });
    }
    if (!data.email) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Email é obrigatório", path: ["email"] });
    }
    if (!data.telefone || data.telefone.replace(/\D/g, "").length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Telefone inválido", path: ["telefone"] });
    }
  }
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
    watch,
    formState: { errors },
  } = useForm<CouncilorInputs>({
    resolver: zodResolver(councilorSchema),
    defaultValues: {
      nome: defaultValues?.nome || "",
      partido: defaultValues?.partido || "",
      cpf: maskCpf(defaultValues?.cpf || ""),
      email: defaultValues?.email || "",
      telefone: maskTelefone(defaultValues?.telefone || ""),
      ativo: defaultValues?.ativo ?? true,
      isPresidente: defaultValues?.isPresidente ?? false,
      isExecutivo: defaultValues?.isExecutivo ?? false,
      foto_url: defaultValues?.foto_url || "",
      data_inicio: defaultValues?.data_inicio || "",
      data_fim: defaultValues?.data_fim || "",
    }
  })

  const [cpfDisplay, setCpfDisplay] = useState(maskCpf(defaultValues?.cpf || ""))
  const [telefoneDisplay, setTelefoneDisplay] = useState(maskTelefone(defaultValues?.telefone || ""))
  const [isUploading, setIsUploading] = useState(false)
  const [partyLogos, setPartyLogos] = useState<Record<string, string>>({})
  const supabase = createClient()

  const partido = watch("partido")

  useEffect(() => {
    async function fetchParties() {
      const { data } = await supabase.from('partidos').select('sigla, logo_url')
      if (data) {
        const mapping = data.reduce((acc: any, p: any) => {
          if (p.logo_url) acc[p.sigla.toUpperCase()] = p.logo_url
          return acc
        }, {})
        setPartyLogos(mapping)
      }
    }
    fetchParties()
  }, [])

  const currentPartyLogo = partido ? partyLogos[partido.toUpperCase()] : null

  const fotoUrl = watch("foto_url")

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Extract slug from path
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const pathParts = pathname.split('/');
      const slug = pathParts[2] || 'default'; // admin/[slug]/vereadores

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${slug}/vereadores/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('camara')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('camara')
        .getPublicUrl(filePath)

      setValue("foto_url", publicUrl, { shouldValidate: true })
    } catch (error: any) {
      alert("Erro no upload: " + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFormSubmit = async (data: CouncilorInputs) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-xl bg-muted/30 gap-3">
        <div className="relative h-24 w-24 rounded-full border-2 border-primary/20 bg-muted overflow-hidden group">
          {fotoUrl ? (
            <>
              <img src={fotoUrl} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setValue("foto_url", "")}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              <Camera className="h-8 w-8" />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>
        
        <input 
          type="file" 
          id="photo-upload" 
          className="hidden" 
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        <label 
          htmlFor="photo-upload"
          className={cn(
            "flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg cursor-pointer hover:bg-muted transition-all text-sm font-medium",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <Upload className="h-4 w-4" />
          {fotoUrl ? "Trocar Foto" : "Fazer Upload de Foto"}
        </label>
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Recomendado: 400x400px (JPG/PNG)</p>
      </div>

      <div className="flex items-center space-x-2 p-3 bg-primary/5 border border-primary/10 rounded-lg">
        <input
          {...register("isExecutivo")}
          id="isExecutivo"
          type="checkbox"
          className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/50"
        />
        <label htmlFor="isExecutivo" className="text-sm font-semibold text-primary cursor-pointer">
          Chefe do Executivo (Prefeito/Vice)
        </label>
      </div>

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

      {!watch("isExecutivo") && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="partido">Partido</label>
              <div className="relative">
                <input 
                  {...register("partido")}
                  id="partido"
                  type="text" 
                  className={`w-full bg-background border ${errors.partido ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
                  placeholder="Ex: PSD"
                />
                {currentPartyLogo && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded bg-muted flex items-center justify-center p-1 border border-border">
                    <img src={currentPartyLogo} alt="Logo Partido" className="h-full w-full object-contain" />
                  </div>
                )}
              </div>
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
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="data_inicio">Início do Mandato</label>
          <input 
            {...register("data_inicio")}
            id="data_inicio"
            type="date" 
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="data_fim">Fim do Mandato</label>
          <input 
            {...register("data_fim")}
            id="data_fim"
            type="date" 
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
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
