"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit2, Trash2, User, Plus, List } from "lucide-react"
import { MesaDiretoraForm } from "./MesaDiretoraForm"
import { upsertMesaMember, removeMesaMember } from "@/app/admin/_actions/mesa_diretora"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

import { createMongoAbility, RawRuleOf, MongoAbility } from "@casl/ability"
import { Action, Subject } from "@/lib/casl/ability"
import { useMemo } from "react"

interface MesaDiretoraClientProps {
  members: any[]
  cargos: any[]
  vereadores: any[]
  slug: string
  camaraId: string
  rules?: RawRuleOf<MongoAbility<[Action, Subject]>>[]
}

export function MesaDiretoraClient({ members, cargos, vereadores, slug, camaraId, rules = [] }: MesaDiretoraClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("list")
  const [editingMember, setEditingMember] = useState<any | null>(null)

  // Reconstruir abilidade no cliente de forma estável
  const ability = useMemo(() => createMongoAbility<[Action, Subject]>(rules), [rules])
  const can = (action: Action, subject: Subject) => ability.can(action, subject)

  // ConfirmDialog State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm?: () => void
    variant?: "default" | "destructive"
    type?: "confirm" | "alert"
  }>({
    isOpen: false,
    title: "",
    description: "",
  })

  const showAlert = (title: string, description: string) => {
    setConfirmConfig({
      isOpen: true,
      title,
      description,
      type: "alert",
      variant: "default",
    })
  }

  const handleCreateOrUpdate = async (data: any) => {
    startTransition(async () => {
      const result = await upsertMesaMember(slug, camaraId, {
        id: editingMember?.id,
        ...data
      })
      
      if (result?.error) {
        showAlert("Erro", result.error)
      } else {
        setEditingMember(null)
        setActiveTab("list")
        router.refresh()
      }
    })
  }

  const handleDelete = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Remover da Mesa",
      description: "Tem certeza que deseja remover este membro da mesa diretora?",
      variant: "destructive",
      type: "confirm",
      onConfirm: async () => {
        startTransition(async () => {
          const result = await removeMesaMember(slug, id)
          if (result?.error) {
            showAlert("Erro", result.error)
          } else {
            router.refresh()
          }
        })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Mesa Diretora</h1>
          <p className="text-muted-foreground text-sm">Gerencie a composição da mesa diretora da sua Câmara.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v)
        if (v === "list") setEditingMember(null)
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Composição Atual
          </TabsTrigger>
          {can('manage', 'MesaDiretora') && (
            <TabsTrigger value="form" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {editingMember ? "Editar Membro" : "Novo Membro"}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-4 animate-in fade-in duration-500">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Parlamentar</th>
                    <th className="px-6 py-4">Cargo</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <User className="h-10 w-10 opacity-20" />
                          <p>Nenhum membro na mesa diretora.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => (
                      <tr key={member.id} className="hover:bg-muted/50 transition-colors group">
                        <td className="px-6 py-4 font-medium text-foreground">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-primary overflow-hidden border border-border">
                              {member.vereadores?.foto_url ? (
                                <img src={member.vereadores.foto_url} alt={member.vereadores.nome} className="h-full w-full object-cover" />
                              ) : (
                                <User className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold">{member.vereadores?.nome}</span>
                              <span className="text-muted-foreground text-xs">{member.vereadores?.partido}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary shadow-none font-bold uppercase tracking-wider text-[10px]">
                            {member.cargos?.nome}
                          </Badge>
                        </td>
                         <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {can('manage', 'MesaDiretora') && (
                              <>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setEditingMember(member)
                                    setActiveTab("form")
                                  }}
                                  className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-md"
                                  title="Editar"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleDelete(member.id)}
                                  className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors rounded-md"
                                  title="Remover"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="form" className="animate-in slide-in-from-left-2 fade-in duration-500">
           <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
             <h2 className="text-xl font-bold text-foreground mb-6">
               {editingMember ? "Editar Membro da Mesa" : "Adicionar Membro à Mesa"}
             </h2>
             <MesaDiretoraForm 
               defaultValues={editingMember || undefined}
               cargos={cargos}
               vereadores={vereadores}
               isPending={isPending}
               onSubmit={handleCreateOrUpdate}
               onCancel={() => {
                 setEditingMember(null)
                 setActiveTab("list")
               }}
             />
           </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
        type={confirmConfig.type}
      />
    </div>
  )
}
