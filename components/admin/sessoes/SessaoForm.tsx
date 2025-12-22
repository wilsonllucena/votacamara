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
            <Label htmlFor="titulo" className="text-zinc-400">Título da Sessão</Label>
            <Input
            id="titulo"
            {...register("titulo")}
            placeholder="Ex: 15ª Sessão Ordinária"
            className="bg-zinc-900 border-zinc-800 text-white focus:border-blue-500/50"
            />
            {errors.titulo && <p className="text-xs text-red-500">{errors.titulo.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="tipo" className="text-zinc-400">Tipo</Label>
            <select
                id="tipo"
                {...register("tipo")}
                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
                <option value="ordinaria">Ordinária</option>
                <option value="extraordinaria">Extraordinária</option>
            </select>
            {errors.tipo && <p className="text-xs text-red-500">{errors.tipo.message}</p>}
            </div>

            <div className="space-y-2">
            <Label htmlFor="status" className="text-zinc-400">Status</Label>
            <select
                id="status"
                {...register("status")}
                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
                <option value="agendada">Agendada</option>
                <option value="aberta">Aberta</option>
                <option value="encerrada">Encerrada</option>
            </select>
            {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="data" className="text-zinc-400">Data</Label>
            <Input
                id="data"
                type="date"
                {...register("data")}
                className="bg-zinc-900 border-zinc-800 text-white focus:border-blue-500/50"
            />
            {errors.data && <p className="text-xs text-red-500">{errors.data.message}</p>}
            </div>

            <div className="space-y-2">
            <Label htmlFor="hora" className="text-zinc-400">Hora</Label>
            <Input
                id="hora"
                type="time"
                {...register("hora")}
                className="bg-zinc-900 border-zinc-800 text-white focus:border-blue-500/50"
            />
            {errors.hora && <p className="text-xs text-red-500">{errors.hora.message}</p>}
            </div>
        </div>
      </div>

      <div className="space-y-3 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
              <Label className="text-white font-bold">
                  {defaultValues ? "Pauta da Sessão" : "Projetos em Pauta"}
              </Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={toggleAll}
                    disabled={availableProjects.length === 0}
                    className="h-8 text-xs text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                  >
                      {isAllSelected ? "Desmarcar Todos" : "Selecionar Todos"}
                  </Button>
              </div>

              {availableProjects.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-2">Nenhum projeto com status "Em Pauta" disponível.</p>
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
                                    ? "bg-zinc-900 border-zinc-800 opacity-40 cursor-not-allowed" 
                                    : selected 
                                        ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/30 cursor-pointer" 
                                        : "bg-zinc-950 border-zinc-800 hover:border-zinc-700 cursor-pointer"
                              }`}
                            >
                                <div className={`mt-1 h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                                    selected
                                    ? "bg-blue-600 border-blue-600"
                                    : "bg-transparent border-zinc-700"
                                }`}>
                                    {selected && (
                                        <div className="h-2 w-2 bg-white rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white line-clamp-1">{projeto.titulo}</p>
                                    <p className="text-[10px] text-zinc-500">
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

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
        >
          {isPending ? "Salvando..." : "Salvar Sessão"}
        </Button>
      </div>
    </form>
  )
}
