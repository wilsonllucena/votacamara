"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SessaoInputs } from "@/app/admin/_actions/sessoes"
import { Menu, Calendar, Upload, Info, ArrowRight } from "lucide-react"

const sessaoSchema = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  tipo: z.enum(["ordinaria", "extraordinaria"]),
  status: z.enum(["agendada", "aberta", "encerrada"]),
  data: z.string().min(10, "Data é obrigatória"),
  hora: z.string().min(5, "Hora é obrigatória"),
  projeto_ids: z.array(z.string().uuid()),
})

interface Projeto {
    id: string
    titulo: string
    numero: string
}

interface SessaoFormProps {
  defaultValues?: Partial<SessaoInputs> & { id?: string }
  availableProjects?: Projeto[]
  busyProjects?: { projeto_id: string; sessao_id: string }[]
  onSubmit: (data: SessaoInputs) => void
  onError?: (message: string) => void
  onCancel: () => void
  isPending?: boolean
}

export function SessaoForm({ defaultValues, availableProjects = [], busyProjects = [], onSubmit, onError, onCancel, isPending }: SessaoFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SessaoInputs>({
    resolver: zodResolver(sessaoSchema),
    defaultValues: {
      titulo: defaultValues?.titulo || "",
      tipo: defaultValues?.tipo || "ordinaria",
      status: defaultValues?.status || "agendada",
      data: defaultValues?.data || new Date().toISOString().split('T')[0],
      hora: defaultValues?.hora || "19:00",
      projeto_ids: defaultValues?.projeto_ids || [],
    }
  })

  const selectedProjectIds = watch("projeto_ids") || []
  const isAllSelected = availableProjects.length > 0 && selectedProjectIds.length === availableProjects.length

  const isProjectBusy = (projectId: string) => {
      // It's busy if it's in a busy session AND that session is NOT the one we're editing
      return busyProjects.some(bp => bp.projeto_id === projectId && bp.sessao_id !== defaultValues?.id)
  }

  const toggleAll = () => {
      if (isAllSelected) {
          setValue("projeto_ids", [])
      } else {
          // Only select projects that are NOT busy in other sessions
          const selectableIds = availableProjects
            .filter(p => !isProjectBusy(p.id))
            .map(p => p.id)
          setValue("projeto_ids", selectableIds)
      }
  }

  const toggleProject = (id: string) => {
      const current = selectedProjectIds
      if (current.includes(id)) {
          setValue("projeto_ids", current.filter(pid => pid !== id))
      } else {
          setValue("projeto_ids", [...current, id])
      }
  }

  const onInvalid = (errors: any) => {
      if (errors.projeto_ids) {
          onError?.(errors.projeto_ids.message)
      }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Menu className="w-5 h-5 text-muted-foreground shrink-0" />
          <h3 className="text-sm font-semibold text-foreground">Informações Básicas</h3>
        </div>
        <div className="space-y-2">
          <Label htmlFor="titulo" className="text-muted-foreground">Título da Sessão</Label>
          <Input
            id="titulo"
            {...register("titulo")}
            placeholder="Ex: 15ª Sessão Ordinária do 2º Período Legislativo"
            className="h-11 rounded-lg bg-background border-border text-foreground focus:border-primary/50"
          />
          {errors.titulo && <p className="text-xs text-red-500">{errors.titulo.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipo" className="text-muted-foreground">Tipo de Sessão</Label>
          <select
            id="tipo"
            {...register("tipo")}
            className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="ordinaria">Ordinária</option>
            <option value="extraordinaria">Extraordinária</option>
          </select>
          {errors.tipo && <p className="text-xs text-red-500">{errors.tipo.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="data-hora" className="text-muted-foreground">Data e Horário</Label>
          <div className="relative flex gap-2">
            <Input
              id="data"
              type="date"
              {...register("data")}
              className="h-11 flex-1 rounded-lg bg-background border-border text-foreground focus:border-primary/50"
            />
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="hora"
                type="time"
                {...register("hora")}
                className="h-11 pl-10 rounded-lg bg-background border-border text-foreground focus:border-primary/50"
              />
            </div>
          </div>
          {(errors.data || errors.hora) && (
            <p className="text-xs text-red-500">{errors.data?.message || errors.hora?.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pauta" className="text-muted-foreground">Pauta da Sessão (Agenda)</Label>
          <textarea
            id="pauta"
            placeholder="Descreva os principais pontos a serem discutidos, projetos em pauta e ordens do dia..."
            className="flex min-h-[120px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
          />
        </div>
      </div>

      {/* Projetos em Pauta (mantido para funcionalidade) */}
      {availableProjects.length > 0 && (
        <div className="space-y-3 bg-muted/20 p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
            <Label className="text-foreground font-bold text-sm">Projetos em Pauta</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleAll}
              className="h-8 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              {isAllSelected ? "Desmarcar Todos" : "Selecionar Todos"}
            </Button>
          </div>
          <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {availableProjects.map((projeto) => {
              const busy = isProjectBusy(projeto.id)
              const selected = selectedProjectIds.includes(projeto.id)
              return (
                <div
                  key={projeto.id}
                  onClick={() => { if (!busy) toggleProject(projeto.id) }}
                  className={`flex items-start gap-3 p-2 rounded border transition-colors cursor-pointer ${
                    busy ? "bg-muted border-border opacity-40 cursor-not-allowed" :
                    selected ? "bg-primary/10 border-primary/30 ring-1 ring-primary/30" :
                    "bg-background border-border hover:border-accent"
                  }`}
                >
                  <div className={`mt-1 h-4 w-4 rounded border flex items-center justify-center ${
                    selected ? "bg-primary border-primary" : "bg-transparent border-border"
                  }`}>
                    {selected && <div className="h-2 w-2 bg-primary-foreground rounded-full" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground line-clamp-1">{projeto.titulo}</p>
                    <p className="text-[10px] text-muted-foreground">Nº {projeto.numero}{busy && " (Em outra sessão ativa)"}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Anexar Documentos da Pauta */}
      <div className="space-y-2">
        <Label className="text-muted-foreground">Anexar Documentos da Pauta</Label>
        <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-2 bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer">
          <Upload className="w-10 h-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Arraste arquivos PDF ou clique para selecionar (Máx 20MB)
          </p>
          <button type="button" className="text-sm text-primary underline hover:no-underline">
            Procurar arquivos
          </button>
        </div>
      </div>

      {/* Info + Botões */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="w-4 h-4 shrink-0" />
          <span>Os vereadores serão notificados automaticamente.</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            type="submit"
            variant="outline"
            disabled={isPending}
            className="w-full sm:w-auto border-border text-muted-foreground hover:text-foreground hover:bg-muted font-bold"
          >
            Salvar Rascunho
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm font-bold px-8"
          >
            {isPending ? "Publicando..." : "Publicar Sessão"}
            <ArrowRight className="w-4 h-4 ml-2 inline" />
          </Button>
        </div>
      </div>
    </form>
  )
}
