"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Users, Plus, List, FileText, BadgeInfo, MoreVertical } from "lucide-react"
import { ComissaoForm } from "./ComissaoForm"
import { Badge } from "@/components/ui/badge"

interface Comissao {
  id: string
  nome: string
  tipo: string
  descricao: string
  membros_count: number
  materias_count: number
}

interface ComissoesClientProps {
  slug: string
  initialComissoes: Comissao[]
  vereadores: any[]
  materias: any[]
}

export function ComissoesClient({ slug, initialComissoes, vereadores, materias }: ComissoesClientProps) {
  const [activeTab, setActiveTab] = useState("list")
  const [comissoes, setComissoes] = useState<Comissao[]>(initialComissoes)

  const handleCreateSuccess = (newData: any) => {
    const newComissao: Comissao = {
        id: Math.random().toString(36).substr(2, 9),
        nome: newData.nome,
        tipo: newData.tipo,
        descricao: newData.descricao,
        membros_count: newData.membros.length,
        materias_count: newData.materias.length,
    }
    setComissoes([newComissao, ...comissoes])
    setActiveTab("list")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Comissões Parlamentares</h1>
          <p className="text-muted-foreground text-sm">Gerencie as comissões, membros e matérias vinculadas.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Listar Comissões
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Comissão
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 animate-in fade-in duration-500">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Comissão</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipo</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Membros</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Matérias</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comissoes.map((comissao) => (
                    <tr key={comissao.id} className="hover:bg-accent/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{comissao.nome}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[300px]">{comissao.descricao}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn(
                            "font-bold",
                            comissao.tipo === "Permanente" ? "border-blue-500/20 bg-blue-500/5 text-blue-500" : "border-amber-500/20 bg-amber-500/5 text-amber-500"
                        )}>
                          {comissao.tipo}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-foreground">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{comissao.membros_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-foreground">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{comissao.materias_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="new" className="animate-in slide-in-from-left-2 fade-in duration-500">
           <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
             <ComissaoForm 
               vereadores={vereadores} 
               materias={materias} 
               onSuccess={handleCreateSuccess}
             />
           </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}
