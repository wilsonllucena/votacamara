"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createVereador } from "@/app/admin/_actions/vereadores"
import { useTransition } from "react"

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  partido: z.string().min(2, "Partido deve ter pelo menos 2 caracteres"),
  cpf: z.string().min(1, "CPF é obrigatório").transform(v => v.replace(/\D/g, "")).pipe(z.string().length(11, "CPF deve ter 11 dígitos")),
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  telefone: z.string().min(1, "Telefone é obrigatório").transform(v => v.replace(/\D/g, "")).pipe(z.string().min(10, "Mínimo 10 dígitos").max(11, "Máximo 11 dígitos")),
  status: z.enum(["Ativo", "Licenciado", "Inativo"]),
  isPresidente: z.boolean(),
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
      cpf: "",
      email: "",
      telefone: "",
      status: "Ativo",
      isPresidente: false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        const formData = new FormData()
        formData.append("nome", values.nome)
        formData.append("partido", values.partido)
        formData.append("cpf", values.cpf)
        formData.append("email", values.email)
        formData.append("telefone", values.telefone)
        formData.append("ativo", values.status === "Ativo" ? "true" : "false")
        formData.append("isPresidente", values.isPresidente ? "true" : "false")
        
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
                
                     {/* CPF */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">CPF</label>
                        <input
                            {...form.register("cpf")}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                            placeholder="000.000.000-00"
                        />
                        {form.formState.errors.cpf && (
                            <p className="text-xs font-medium text-red-500">{form.formState.errors.cpf.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Email</label>
                        <input
                            {...form.register("email")}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                            placeholder="exemplo@camara.gov.br"
                        />
                        {form.formState.errors.email && (
                            <p className="text-xs font-medium text-red-500">{form.formState.errors.email.message}</p>
                        )}
                    </div>

                    {/* Telefone */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Telefone</label>
                        <input
                            {...form.register("telefone")}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                            placeholder="(00) 00000-0000"
                        />
                        {form.formState.errors.telefone && (
                            <p className="text-xs font-medium text-red-500">{form.formState.errors.telefone.message}</p>
                        )}
                    </div>

                 {/* Status */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Status</label>
                         <select
                            {...form.register("status")}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                        >
                            <option value="Ativo">Ativo</option>
                            <option value="Licenciado">Licenciado</option>
                            <option value="Inativo">Inativo</option>
                        </select>
                    </div>

                    {/* Is Presidente */}
                    <div className="flex items-center space-x-2 py-2">
                        <input
                            {...form.register("isPresidente")}
                            id="isPresidente"
                            type="checkbox"
                            className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-blue-600 focus:ring-blue-500/50"
                        />
                        <label htmlFor="isPresidente" className="group flex items-center gap-2 text-sm font-medium text-zinc-300 cursor-pointer">
                            Presidente da Câmara
                            <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors uppercase font-bold tracking-wider">Presidente</span>
                        </label>
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
