"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { registerAction } from "@/app/(auth)/_actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando Conta...</> : "Começar Gratuitamente"}
    </Button>
  )
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, null)

  return (
    <div className="bg-slate-950/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Criar Nova Câmara</h1>
        <p className="text-slate-400 mt-2 text-sm">Cadastre sua instituição para começar a usar</p>
      </div>

      <form action={formAction} className="space-y-4">
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
                    id="camara_nome"
                    name="camara_nome"
                    type="text" 
                    required
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all sm:text-sm"
                    placeholder="Ex: Câmara Municipal de Goiânia"
                />
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium text-slate-300" htmlFor="cidade">Cidade</label>
                    <input 
                        id="cidade"
                        name="cidade"
                        type="text" 
                        required
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all sm:text-sm"
                        placeholder="Nome da Cidade"
                    />
                </div>
                <div className="col-span-1 space-y-2">
                    <label className="text-sm font-medium text-slate-300" htmlFor="uf">UF</label>
                    <input 
                        id="uf"
                        name="uf"
                        type="text" 
                        required
                        maxLength={2}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all sm:text-sm uppercase text-center"
                        placeholder="GO"
                    />
                </div>
            </div>
        </div>

        {/* Admin Info */}
        <div className="space-y-3 pt-2">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Administrador do Sistema</h3>
             
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="admin_nome">Nome Completo</label>
                <input 
                    id="admin_nome"
                    name="admin_nome"
                    type="text" 
                    required
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all sm:text-sm"
                    placeholder="Seu nome"
                />
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="email">Email</label>
                <input 
                    id="email"
                    name="email"
                    type="email" 
                    required
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all sm:text-sm"
                    placeholder="admin@camara.leg.br"
                />
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="password">Senha de Acesso</label>
                <input 
                    id="password" 
                    name="password"
                    type="password" 
                    required
                    minLength={6}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all sm:text-sm"
                    placeholder="Mínimo 6 caracteres"
                />
             </div>
        </div>

        <div className="pt-2">
            <SubmitButton />
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        Já tem cadastro? <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Fazer Login</Link>
      </div>
    </div>
  )
}
