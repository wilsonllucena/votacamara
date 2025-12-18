"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createSessao } from "@/app/admin/_actions/sessoes"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  titulo: z.string().min(3, "Título muito curto"),
  tipo: z.enum(["Ordinária", "Extraordinária"]),
  status: z.enum(["Agendada", "Aberta", "Encerrada"]),
  data: z.string().min(1, "Data é obrigatória"),
  hora: z.string().min(1, "Hora é obrigatória"),
})

interface SessaoFormProps {
    slug: string
}

export function SessaoForm({ slug }: SessaoFormProps) {
  const [isPending, startTransition] = useTransition()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      tipo: "Ordinária",
      status: "Agendada",
      data: "",
      hora: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        const formData = new FormData()
        formData.append("titulo", values.titulo)
        formData.append("tipo", values.tipo)
        formData.append("status", values.status)
        formData.append("data", values.data)
        formData.append("hora", values.hora)
        
        await createSessao(slug, null, formData)
    })
  }

  return (
    <Card className="bg-slate-900 border-slate-800 text-white max-w-2xl">
        <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-4">
                    {/* Titulo */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Título da Sessão</label>
                        <input
                            {...form.register("titulo")}
                            className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                            placeholder="Ex: Sessão Ordinária #042"
                        />
                        {form.formState.errors.titulo && (
                            <p className="text-xs font-medium text-red-500">{form.formState.errors.titulo.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Tipo */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Tipo</label>
                            <select
                                {...form.register("tipo")}
                                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="Ordinária">Ordinária</option>
                                <option value="Extraordinária">Extraordinária</option>
                            </select>
                        </div>
                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Status Inicial</label>
                            <select
                                {...form.register("status")}
                                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="Agendada">Agendada</option>
                                <option value="Aberta">Aberta</option>
                                <option value="Encerrada">Encerrada</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Data */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Data</label>
                            <input
                                type="date"
                                {...form.register("data")}
                                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                             {form.formState.errors.data && (
                                <p className="text-xs font-medium text-red-500">{form.formState.errors.data.message}</p>
                            )}
                        </div>
                         {/* Hora */}
                         <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Hora</label>
                            <input
                                type="time"
                                {...form.register("hora")}
                                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                             {form.formState.errors.hora && (
                                <p className="text-xs font-medium text-red-500">{form.formState.errors.hora.message}</p>
                            )}
                        </div>
                    </div>

                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800">Cancelar</Button>
                    <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-500 text-white">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Sessão
                    </Button>
                </div>
            </form>
        </CardContent>
    </Card>
  )
}
