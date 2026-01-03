"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SessaoInputs } from "@/app/admin/_actions/sessoes"

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
  onCancel: () => void
  isPending?: boolean
}

export function SessaoForm({ defaultValues, availableProjects = [], busyProjects = [], onSubmit, onCancel, isPending }: SessaoFormProps) {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="titulo" className="text-muted-foreground">Título da Sessão</Label>
            <Input
            id="titulo"
            {...register("titulo")}
            placeholder="Ex: 15ª Sessão Ordinária"
            className="bg-background border-border text-foreground focus:border-primary/50"
            />
            {errors.titulo && <p className="text-xs text-red-500">{errors.titulo.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="tipo" className="text-muted-foreground">Tipo</Label>
            <select
                id="tipo"
                {...register("tipo")}
                className="flex h-11 sm:h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
                <option value="ordinaria">Ordinária</option>
                <option value="extraordinaria">Extraordinária</option>
            </select>
            {errors.tipo && <p className="text-xs text-red-500">{errors.tipo.message}</p>}
            </div>

            <div className="space-y-2">
            <Label htmlFor="status" className="text-muted-foreground">Status</Label>
            <select
                id="status"
                {...register("status")}
                className="flex h-11 sm:h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
                <option value="agendada">Agendada</option>
                <option value="aberta">Aberta</option>
                <option value="encerrada">Encerrada</option>
            </select>
            {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="data" className="text-muted-foreground">Data</Label>
            <Input
                id="data"
                type="date"
                {...register("data")}
                className="h-11 sm:h-10 bg-background border-border text-foreground focus:border-primary/50"
            />
            {errors.data && <p className="text-xs text-red-500">{errors.data.message}</p>}
            </div>

            <div className="space-y-2">
            <Label htmlFor="hora" className="text-muted-foreground">Hora</Label>
            <Input
                id="hora"
                type="time"
                {...register("hora")}
                className="h-11 sm:h-10 bg-background border-border text-foreground focus:border-primary/50"
            />
            {errors.hora && <p className="text-xs text-red-500">{errors.hora.message}</p>}
            </div>
        </div>
      </div>

      <div className="space-y-3 bg-muted/20 p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
              <Label className="text-foreground font-bold">
                  {defaultValues ? "Pauta da Sessão" : "Projetos em Pauta"}
              </Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={toggleAll}
                    disabled={availableProjects.length === 0}
                    className="h-8 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
                  >
                      {isAllSelected ? "Desmarcar Todos" : "Selecionar Todos"}
                  </Button>
              </div>

              {availableProjects.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">Nenhum projeto com status "Em Pauta" disponível.</p>
              ) : (
                  <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {availableProjects.map((projeto) => {
                          const busy = isProjectBusy(projeto.id)
                          const selected = selectedProjectIds.includes(projeto.id)
                          
                          return (
                            <div 
                              key={projeto.id} 
                              onClick={() => {
                                  if (!busy) toggleProject(projeto.id)
                              }}
                              className={`flex items-start gap-3 p-2 rounded border transition-colors ${
                                  busy 
                                    ? "bg-muted border-border opacity-40 cursor-not-allowed" 
                                    : selected 
                                        ? "bg-primary/10 border-primary/30 ring-1 ring-primary/30 cursor-pointer" 
                                        : "bg-background border-border hover:border-accent cursor-pointer"
                              }`}
                            >
                                <div className={`mt-1 h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                                    selected
                                    ? "bg-primary border-primary"
                                    : "bg-transparent border-border"
                                }`}>
                                    {selected && (
                                        <div className="h-2 w-2 bg-primary-foreground rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground line-clamp-1">{projeto.titulo}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Nº {projeto.numero} 
                                        {busy && " (Em outra sessão ativa)"}
                                    </p>
                                </div>
                            </div>
                          )
                      })}
                  </div>
              )}
          </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto border-border text-muted-foreground hover:text-foreground hover:bg-muted font-bold"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm font-bold px-8"
        >
          {isPending ? "Salvando..." : "Salvar Sessão"}
        </Button>
      </div>
    </form>
  )
}
