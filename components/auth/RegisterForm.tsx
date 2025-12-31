"use client"

import { useActionState, useState, startTransition } from "react"
import { registerAction } from "@/app/(auth)/_actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { maskCnpj, maskTelefone } from "@/lib/utils"

const registerSchema = z.object({
  camara_nome: z.string().min(3, "Mínimo 3 caracteres"),
  cnpj: z.string().min(1, "CNPJ é obrigatório").transform(v => v.replace(/\D/g, "")).pipe(z.string().length(14, "CNPJ deve ter 14 dígitos")),
  telefone: z.string().min(1, "Telefone é obrigatório").transform(v => v.replace(/\D/g, "")).pipe(z.string().min(10, "Mínimo 10 dígitos").max(11, "Máximo 11 dígitos")),
  cidade: z.string().min(2, "Cidade obrigatória"),
  uf: z.string().length(2, "UF deve ter 2 caracteres"),
  admin_nome: z.string().min(2, "Nome obrigatório"),
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

type RegisterInputs = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null)
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      camara_nome: "",
      cnpj: "",
      telefone: "",
      cidade: "",
      uf: "",
      admin_nome: "",
      email: "",
      password: "",
    }
  })

  const [cnpjDisplay, setCnpjDisplay] = useState("")
  const [telefoneDisplay, setTelefoneDisplay] = useState("")

  const onSubmit = (data: any) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string)
    })
    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <div className="bg-slate-950/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Criar Nova Câmara</h1>
        <p className="text-slate-400 mt-2 text-sm">Cadastre sua instituição para começar a usar</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {state?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm text-center">
                {state.error}
            </div>
        )}
        
        {/* Info Instituição */}
        <div className="space-y-3 pb-4 border-b border-slate-800/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dados da Instituição</h3>
            
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="camara_nome">Nome da Câmara</label>
                <input 
                    {...register("camara_nome")}
                    id="camara_nome"
                    type="text" 
                    className={`w-full bg-slate-900/50 border ${errors.camara_nome ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all sm:text-sm`}
                    placeholder="Ex: Câmara Municipal de Goiânia"
                />
                {errors.camara_nome && <p className="text-xs text-red-500 mt-1">{errors.camara_nome.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300" htmlFor="cnpj">CNPJ</label>
                  <input 
                      id="cnpj"
                      type="text" 
                      value={cnpjDisplay}
                      onChange={(e) => {
                        const masked = maskCnpj(e.target.value)
                        setCnpjDisplay(masked)
                        setValue("cnpj", masked, { shouldValidate: true })
                      }}
                      className={`w-full bg-slate-900/50 border ${errors.cnpj ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all sm:text-sm`}
                      placeholder="00.000.000/0000-00"
                  />
                  {errors.cnpj && <p className="text-xs text-red-500 mt-1">{errors.cnpj.message}</p>}
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300" htmlFor="telefone">Telefone</label>
                  <input 
                      id="telefone"
                      type="text" 
                      value={telefoneDisplay}
                      onChange={(e) => {
                        const masked = maskTelefone(e.target.value)
                        setTelefoneDisplay(masked)
                        setValue("telefone", masked, { shouldValidate: true })
                      }}
                      className={`w-full bg-slate-900/50 border ${errors.telefone ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all sm:text-sm`}
                      placeholder="(00) 00000-0000"
                  />
                  {errors.telefone && <p className="text-xs text-red-500 mt-1">{errors.telefone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium text-slate-300" htmlFor="cidade">Cidade</label>
                    <input 
                        {...register("cidade")}
                        id="cidade"
                        type="text" 
                        className={`w-full bg-slate-900/50 border ${errors.cidade ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all sm:text-sm`}
                        placeholder="Nome da Cidade"
                    />
                    {errors.cidade && <p className="text-xs text-red-500 mt-1">{errors.cidade.message}</p>}
                </div>
                <div className="col-span-1 space-y-2">
                    <label className="text-sm font-medium text-slate-300" htmlFor="uf">UF</label>
                    <input 
                        {...register("uf")}
                        id="uf"
                        type="text" 
                        maxLength={2}
                        className={`w-full bg-slate-900/50 border ${errors.uf ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all sm:text-sm uppercase text-center`}
                        placeholder="GO"
                    />
                    {errors.uf && <p className="text-xs text-red-500 mt-1">{errors.uf.message}</p>}
                </div>
            </div>
        </div>

        {/* Admin Info */}
        <div className="space-y-3 pt-2">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Administrador do Sistema</h3>
             
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="admin_nome">Nome Completo</label>
                <input 
                    {...register("admin_nome")}
                    id="admin_nome"
                    type="text" 
                    className={`w-full bg-slate-900/50 border ${errors.admin_nome ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all sm:text-sm`}
                    placeholder="Seu nome"
                />
                {errors.admin_nome && <p className="text-xs text-red-500 mt-1">{errors.admin_nome.message}</p>}
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="email">Email</label>
                <input 
                    {...register("email")}
                    id="email"
                    type="email" 
                    className={`w-full bg-slate-900/50 border ${errors.email ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all sm:text-sm`}
                    placeholder="admin@camara.leg.br"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="password">Senha de Acesso</label>
                <input 
                    {...register("password")}
                    id="password" 
                    type="password" 
                    className={`w-full bg-slate-900/50 border ${errors.password ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all sm:text-sm`}
                    placeholder="Mínimo 6 caracteres"
                />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
             </div>
        </div>

        <div className="pt-2">
            <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0" disabled={isPending}>
                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando Conta...</> : "Começar Gratuitamente"}
            </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        Já tem cadastro? <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Fazer Login</Link>
      </div>
    </div>
  )
}
