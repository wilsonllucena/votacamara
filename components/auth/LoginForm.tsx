"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { loginAction } from "@/app/(auth)/_actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</> : "Entrar na Plataforma"}
    </Button>
  )
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, null)

  return (
    <div className="bg-slate-950/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
      <div className="mb-8 text-center">
        <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">V</div>
        <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
        <p className="text-slate-400 mt-2">Acesse o painel da sua Câmara</p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm text-center">
                {state.error}
            </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="email">Email Corporativo</label>
          <input 
            id="email"
            name="email"
            type="email" 
            required
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="seu@email.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-slate-300" htmlFor="password">Senha</label>
            <Link href="#" className="text-xs text-blue-400 hover:text-blue-300">Esqueceu a senha?</Link>
          </div>
          <input 
            id="password" 
            name="password"
            type="password" 
            required
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="••••••••"
          />
        </div>

        <SubmitButton />
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        Ainda não tem conta? <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">Criar nova Câmara</Link>
      </div>
    </div>
  )
}
