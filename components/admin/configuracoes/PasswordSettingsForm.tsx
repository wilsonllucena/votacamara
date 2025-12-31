"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, KeyRound, AlertCircle } from "lucide-react"

const passwordSchema = z.object({
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme a nova senha"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

type PasswordInputs = z.infer<typeof passwordSchema>

interface PasswordSettingsFormProps {
  onSubmit: (data: PasswordInputs) => void
  isPending?: boolean
  userRole: string
}

export function PasswordSettingsForm({ onSubmit, isPending, userRole }: PasswordSettingsFormProps) {
  const isAdmin = userRole === 'ADMIN'
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordInputs>({
    resolver: zodResolver(passwordSchema),
  })

  const onFormSubmit = (data: PasswordInputs) => {
    onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="max-w-md mx-auto space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-4 items-start">
        <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
        <div>
            <h4 className="text-sm font-bold text-foreground">Dica de Segurança</h4>
            <p className="text-xs text-muted-foreground mt-1">
                Use uma senha forte com letras, números e caracteres especiais para maior proteção da sua conta.
            </p>
        </div>
      </div>

      <div className="space-y-4">
        {!isAdmin && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-4 items-start text-amber-500">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-xs font-medium">Apenas administradores podem alterar as senhas de acesso da Câmara.</p>
          </div>
        )}

        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2" htmlFor="newPassword">
                <KeyRound className="h-3.5 w-3.5" /> Nova Senha
            </label>
            <input 
              {...register("newPassword")}
              id="newPassword"
              type="password" 
              disabled={!isAdmin}
              className={`w-full bg-background border ${errors.newPassword ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="••••••••"
            />
            {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2" htmlFor="confirmPassword">
                <KeyRound className="h-3.5 w-3.5" /> Confirmar Nova Senha
            </label>
            <input 
              {...register("confirmPassword")}
              id="confirmPassword"
              type="password" 
              disabled={!isAdmin}
              className={`w-full bg-background border ${errors.confirmPassword ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <div className="flex justify-start">
        <Button 
          type="submit" 
          disabled={isPending || !isAdmin}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm px-8 h-11 font-bold"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Atualizar Senha"}
        </Button>
      </div>
    </form>
  )
}
