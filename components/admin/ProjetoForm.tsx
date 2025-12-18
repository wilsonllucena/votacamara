"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createProjeto } from "@/app/admin/_actions/projetos"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  numero: z.string().min(1, "Número é obrigatório"),
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  ementa: z.string().min(10, "Ementa deve ser detalhada"),
  autor: z.string().min(2, "Autor é obrigatório"),
  texto_url: z.string().url("URL inválida").optional().or(z.literal("")),
  status: z.enum(["Rascunho", "Em Pauta", "Votado"]),
})

interface ProjetoFormProps {
    slug: string
}

export function ProjetoForm({ slug }: ProjetoFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numero: "",
      titulo: "",
      ementa: "",
      autor: "",
      texto_url: "",
      status: "Rascunho",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        const formData = new FormData()
        formData.append("numero", values.numero)
        formData.append("titulo", values.titulo)
        formData.append("ementa", values.ementa)
        formData.append("autor", values.autor)
        formData.append("texto_url", values.texto_url || "")
        formData.append("status", values.status)
        
        await createProjeto(slug, null, formData)
    })
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 text-white max-w-2xl">
        <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                        {/* Numero */}
                        <div className="col-span-1 space-y-2">
                            <label className="text-sm font-medium leading-none">Número</label>
                            <input
                                {...form.register("numero")}
                                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="001/2024"
                            />
                        </div>
                         {/* Titulo */}
                        <div className="col-span-3 space-y-2">
                            <label className="text-sm font-medium leading-none">Título Curto</label>
                            <input
                                {...form.register("titulo")}
                                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Ex: Projeto de Lei da Saúde"
                            />
                        </div>
                    </div>

                    {/* Ementa */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Ementa Completa</label>
                        <textarea
                            {...form.register("ementa")}
                            className="flex min-h-[100px] w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="Descreva o projeto..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Autor */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Autor</label>
                            <input
                                {...form.register("autor")}
                                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Nome do Vereador ou Executivo"
                            />
                        </div>
                        {/* Status */}
                         <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Status</label>
                            <select
                                {...form.register("status")}
                                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="Rascunho">Rascunho</option>
                                <option value="Em Pauta">Em Pauta</option>
                                <option value="Votado">Votado</option>
                            </select>
                        </div>
                    </div>

                     {/* Link Texto */}
                     <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Link para Texto Integral (PDF)</label>
                        <input
                            {...form.register("texto_url")}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="https://..."
                        />
                    </div>

                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">Cancelar</Button>
                    <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-500 text-white">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Projeto
                    </Button>
                </div>
            </form>
        </CardContent>
    </Card>
  )
}
