"use client"

import { useState, useTransition } from "react"
import { Settings, Shield, Building, CheckCircle2, AlertCircle } from "lucide-react"
import { ChamberSettingsForm } from "./ChamberSettingsForm"
import { PasswordSettingsForm } from "./PasswordSettingsForm"
import { updateCamaraSettings, updateUserPassword } from "@/app/admin/_actions/configuracoes"
import { cn } from "@/lib/utils"

interface SettingsClientProps {
  slug: string
  camara: {
    nome: string
    telefone: string | null
    cnpj: string | null
    logo_url: string | null
    endereco: string | null
    cidade: string | null
    uf: string | null
  }
  userRole: string
}

export function SettingsClient({ slug, camara, userRole }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<"geral" | "seguranca">("geral")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const handleUpdateChamber = async (data: any) => {
    setMessage(null)
    startTransition(async () => {
      const result = await updateCamaraSettings(slug, data)
      if (result.success) {
        setMessage({ type: "success", text: "Configurações da Câmara atualizadas com sucesso!" })
      } else {
        setMessage({ type: "error", text: result.error || "Erro ao atualizar configurações." })
      }
    })
  }

  const handleUpdatePassword = async (data: any) => {
    setMessage(null)
    startTransition(async () => {
      const result = await updateUserPassword(data)
      if (result.success) {
        setMessage({ type: "success", text: "Senha alterada com sucesso!" })
      } else {
        setMessage({ type: "error", text: result.error || "Erro ao alterar a senha." })
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 text-left">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm">Gerencie as preferências da Câmara e segurança da sua conta.</p>
      </div>

      <div className="flex justify-start border-b border-border">
        <button
          onClick={() => { setActiveTab("geral"); setMessage(null); }}
          className={cn(
            "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative",
            activeTab === "geral" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Building className="h-4 w-4" />
          Perfil da Câmara
          {activeTab === "geral" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button
          onClick={() => { setActiveTab("seguranca"); setMessage(null); }}
          className={cn(
            "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative",
            activeTab === "seguranca" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Shield className="h-4 w-4" />
          Segurança e Senha
          {activeTab === "seguranca" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      </div>

      {message && (
        <div className={cn(
          "flex items-center gap-3 p-4 rounded-xl border animate-in fade-in slide-in-from-top-2",
          message.type === "success" 
            ? "bg-green-500/10 border-green-500/20 text-green-500" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        )}>
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="pt-2">
        {activeTab === "geral" ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <ChamberSettingsForm 
              userRole={userRole}
              defaultValues={{
                nome: camara.nome,
                telefone: camara.telefone || "",
                cnpj: camara.cnpj || "",
                logo_url: camara.logo_url || "",
                endereco: camara.endereco || "",
                cidade: camara.cidade || "",
                uf: camara.uf || "",
              }}
              onSubmit={handleUpdateChamber}
              isPending={isPending}
            />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
             <PasswordSettingsForm 
                userRole={userRole}
                onSubmit={handleUpdatePassword}
                isPending={isPending}
             />
          </div>
        )}
      </div>
    </div>
  )
}
