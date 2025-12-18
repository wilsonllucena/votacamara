"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createVereador } from "@/app/admin/_actions/vereadores"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"

// If Form components don't exist, I'll fallback to raw HTML/Tailwind in this file for speed
// But standard Shadcn usually has them. Let's assume I need to handle it manually if they aren't there.
// I saw `components/ui` only has badge, button, card. So I DO NOT have Form/Input/Label.
// I will create simple versions inline or use raw HTML.

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  partido: z.string().min(1, "Partido é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  status: z.enum(["Ativo", "Licenciado", "Inativo"]),
})

interface VereadorFormProps {
    slug: string
}

export function VereadorForm({ slug }: VereadorFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      partido: "",
      status: "Ativo",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        const formData = new FormData()
        formData.append("nome", values.nome)
        formData.append("partido", values.partido)
        formData.append("status", values.status)
        
        await createVereador(slug, null, formData)
    })
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 text-white max-w-2xl">
        <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-4">
                    {/* Nome */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Nome Completo</label>
                        <input
                            {...form.register("nome")}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                            placeholder="Ex: Carlos Silva"
                        />
                        {form.formState.errors.nome && (
                            <p className="text-xs font-medium text-red-500">{form.formState.errors.nome.message}</p>
                        )}
                    </div>

                    {/* Partido */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Partido</label>
                         <input
                            {...form.register("partido")}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                            placeholder="Ex: PSD"
                        />
                         {form.formState.errors.partido && (
                            <p className="text-xs font-medium text-red-500">{form.formState.errors.partido.message}</p>
                        )}
                    </div>
                
                 {/* Status */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Status</label>
                         <select
                            {...form.register("status")}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                        >
                            <option value="Ativo">Ativo</option>
                            <option value="Licenciado">Licenciado</option>
                            <option value="Inativo">Inativo</option>
                        </select>
                    </div>

                    {/* Foto Upload Mockup */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Foto Oficial</label>
                        <div className="border-2 border-dashed border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-900/50 transition cursor-pointer">
                            <span className="text-xs">Clique para fazer upload</span>
                        </div>
                    </div>

                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">Cancelar</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white">Salvar Vereador</Button>
                </div>
            </form>
        </CardContent>
    </Card>
  )
}
