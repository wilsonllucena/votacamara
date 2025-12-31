"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, Trash2, Building2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { cn, maskCnpj, maskTelefone } from "@/lib/utils"
import { StateSelect } from "@/components/ui/state-select"

const chamberSchema = z.object({
  nome: z.string().min(3, "Mínimo 3 caracteres"),
  telefone: z.string().optional().or(z.literal("")),
  cnpj: z.string().optional().or(z.literal("")),
  logo_url: z.string().url("URL inválida").optional().or(z.literal("")),
  endereco: z.string().optional().or(z.literal("")),
  cidade: z.string().optional().or(z.literal("")),
  uf: z.string().optional().or(z.literal("")),
})

type ChamberInputs = z.infer<typeof chamberSchema>

interface ChamberSettingsFormProps {
  defaultValues?: Partial<ChamberInputs>
  onSubmit: (data: ChamberInputs) => void
  isPending?: boolean
  userRole: string
}

export function ChamberSettingsForm({ defaultValues, onSubmit, isPending, userRole }: ChamberSettingsFormProps) {
  const [cnpjDisplay, setCnpjDisplay] = useState(maskCnpj(defaultValues?.cnpj || ""))
  const [telefoneDisplay, setTelefoneDisplay] = useState(maskTelefone(defaultValues?.telefone || ""))

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ChamberInputs>({
    resolver: zodResolver(chamberSchema),
    defaultValues: {
      nome: defaultValues?.nome || "",
      telefone: maskTelefone(defaultValues?.telefone || ""),
      cnpj: maskCnpj(defaultValues?.cnpj || ""),
      logo_url: defaultValues?.logo_url || "",
      endereco: defaultValues?.endereco || "",
      cidade: defaultValues?.cidade || "",
      uf: defaultValues?.uf || "",
    }
  })

  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()
  const logoUrl = watch("logo_url")

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Extract slug from path if not available via props
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const pathParts = pathname.split('/');
      const slug = pathParts[2] || 'default'; // admin/[slug]/configuracoes

      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${slug}/logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('camara')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('camara')
        .getPublicUrl(filePath)

      setValue("logo_url", publicUrl, { shouldValidate: true })
    } catch (error: any) {
      alert("Erro no upload: " + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 border border-border rounded-xl bg-card">
        <div className="relative h-32 w-32 rounded-lg border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
          ) : (
            <Building2 className="h-12 w-12 text-muted-foreground opacity-20" />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-foreground">Brasão / Logo da Câmara</h3>
          <p className="text-xs text-muted-foreground max-w-xs">Esta imagem aparecerá no cabeçalho do site e documentos oficiais. Formatos sugeridos: PNG transparente ou SVG.</p>
          <div className="flex gap-2 items-center mt-2">
             <input 
                type="file" 
                id="logo-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
            />
            <label 
                htmlFor="logo-upload"
                className={cn(
                    "flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg cursor-pointer hover:bg-muted transition-all text-xs font-bold",
                    isUploading && "opacity-50 cursor-not-allowed"
                )}
            >
                <Upload className="h-3.5 w-3.5" />
                {logoUrl ? "Trocar Logo" : "Upload Logo"}
            </label>
            {logoUrl && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setValue("logo_url", "")}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-9"
                    type="button"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="nome">Nome Oficial da Câmara</label>
            <input 
              {...register("nome")}
              id="nome"
              type="text" 
              className={`w-full bg-background border ${errors.nome ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
              placeholder="Ex: Câmara Municipal de São Paulo"
            />
            {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>}
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="cnpj">CNPJ</label>
            <input 
              id="cnpj"
              type="text" 
              value={cnpjDisplay}
              onChange={(e) => {
                const masked = maskCnpj(e.target.value)
                setCnpjDisplay(masked)
                setValue("cnpj", masked, { shouldValidate: true })
              }}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="00.000.000/0000-00"
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="telefone">Telefone de Contato</label>
            <input 
              id="telefone"
              type="text" 
              value={telefoneDisplay}
              onChange={(e) => {
                const masked = maskTelefone(e.target.value)
                setTelefoneDisplay(masked)
                setValue("telefone", masked, { shouldValidate: true })
              }}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="(00) 0000-0000"
            />
        </div>

        {userRole === 'ADMIN' && (
          <>
            <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="endereco">Endereço Completo</label>
                <input 
                  {...register("endereco")}
                  id="endereco"
                  type="text" 
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Rua, número, bairro..."
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="cidade">Cidade</label>
                <input 
                  {...register("cidade")}
                  id="cidade"
                  type="text" 
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Ex: São Paulo"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="uf">UF</label>
                <StateSelect 
                  {...register("uf")}
                  id="uf"
                />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-start pt-4">
        <Button 
          type="submit" 
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm px-8 h-11 font-bold"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Salvar Configurações"}
        </Button>
      </div>
    </form>
  )
}
