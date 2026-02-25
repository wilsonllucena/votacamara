"use client"

import { useEffect, useState, useTransition } from "react"
import { Settings, Shield, Building, CheckCircle2, AlertCircle } from "lucide-react"
import { ChamberSettingsForm } from "./ChamberSettingsForm"
import { PasswordSettingsForm } from "./PasswordSettingsForm"
import { updateCamaraSettings, updateUserPassword } from "@/app/admin/_actions/configuracoes"
import { cn } from "@/lib/utils"

import { createMongoAbility, RawRuleOf, MongoAbility } from "@casl/ability"
import { Action, Subject } from "@/lib/casl/ability"
import { useMemo } from "react"

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
  rules?: RawRuleOf<MongoAbility<[Action, Subject]>>[]
}

export function SettingsClient({ slug, camara, userRole, rules = [] }: SettingsClientProps) {
  const ability = useMemo(() => createMongoAbility<[Action, Subject]>(rules), [rules])
  const canUpdateConfig = ability.can('update', 'Configuracao')
  
  const [activeTab, setActiveTab] = useState<"geral" | "seguranca">(canUpdateConfig ? "geral" : "seguranca")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [themeColor, setThemeColor] = useState<string>("#334155")

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme-primary") : null
    const current = saved || getComputedStyle(document.documentElement).getPropertyValue("--primary") || "#334155"
    const normalized = current.trim() || "#334155"
    setThemeColor(normalized)
    if (normalized) {
      applyPrimaryToDom(normalized)
    }
  }, [])

  function applyPrimaryToDom(color: string) {
    document.documentElement.style.setProperty("--primary", color)
    document.documentElement.style.setProperty("--ring", color)
    document.body?.style.setProperty("--primary", color)
    document.body?.style.setProperty("--ring", color)
    const adminWrap = document.querySelector("div.admin-light") as HTMLElement | null
    if (adminWrap) {
      adminWrap.style.setProperty("--primary", color)
      adminWrap.style.setProperty("--ring", color)
    }
    localStorage.setItem("theme-primary", color)
  }

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

  const applyThemeColor = () => {
    applyPrimaryToDom(themeColor)
    setMessage({ type: "success", text: "Cor do tema aplicada." })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 text-left">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm">Gerencie as preferências da Câmara e segurança da sua conta.</p>
      </div>

      <div className="flex justify-start border-b border-border">
        {canUpdateConfig && (
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
        )}
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
            <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-foreground">Aparência</span>
                <span className="text-xs text-muted-foreground">Cor de destaque. Afeta botões, header e seleção do menu.</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Cinza", color: "#334155" },
                  { label: "Azul", color: "#2563eb" },
                  { label: "Verde", color: "#16a34a" },
                  { label: "Laranja", color: "#f97316" },
                  { label: "Violeta", color: "#7c3aed" },
                  { label: "Rosa", color: "#e11d48" },
                  { label: "Lilás", color: "#a78bfa" },
                  { label: "Preto", color: "#0f172a" },
                  { label: "Dourado", color: "#ca8a04" },
                  { label: "Ciano", color: "#06b6d4" },
                  { label: "Teal", color: "#0d9488" },
                  { label: "Carmim", color: "#b91c1c" },
                ].map((opt) => {
                  const isActive = themeColor.toLowerCase() === opt.color.toLowerCase()
                  return (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setThemeColor(opt.color)
                        applyPrimaryToDom(opt.color)
                        setMessage({ type: "success", text: `Cor ${opt.label} aplicada.` })
                      }}
                      className={cn(
                        "flex items-center gap-3 border rounded-xl px-3 py-2 text-sm transition-all bg-card/50 hover:bg-muted/30",
                        isActive ? "border-primary ring-1 ring-primary/30" : "border-border"
                      )}
                      aria-label={`Aplicar cor ${opt.label}`}
                    >
                      <span
                        className="inline-block w-5 h-5 rounded-full border"
                        style={{ backgroundColor: opt.color, borderColor: opt.color }}
                      />
                      <span className={cn("font-medium", isActive ? "text-primary" : "text-foreground")}>
                        {opt.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
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
