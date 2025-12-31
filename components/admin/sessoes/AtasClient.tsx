"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Download, Eye, Clock, CheckCircle2 } from "lucide-react"
import { GenerateAtasDialog } from "./GenerateAtasDialog"
import { cn } from "@/lib/utils"

interface Ata {
  id: string
  sessao_nome: string
  data: string
  status: string
  arquivo_url: string | null
}

interface AtasClientProps {
  slug: string
  initialAtas: Ata[]
}

export function AtasClient({ slug, initialAtas }: AtasClientProps) {
  const [atas, setAtas] = useState<Ata[]>(initialAtas)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Atas das Sessões</h1>
          <p className="text-muted-foreground text-sm">Gerencie as atas oficiais geradas a partir das sessões plenárias.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Gerar Ata
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Sessão</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Data</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {atas.map((ata) => (
                <tr key={ata.id} className="hover:bg-accent/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-foreground">{ata.sessao_nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(ata.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                      ata.status === "Gerada" 
                        ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    )}>
                      {ata.status === "Gerada" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {ata.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {ata.status === "Gerada" ? (
                        <>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver Ata">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Download PDF">
                            <Download className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-3 text-xs font-bold hover:bg-primary hover:text-white border-primary/20"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          Gerar Agora
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <GenerateAtasDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onGenerated={(newAta: { id: string, sessao_nome: string, data: string }) => {
          // Here we would normally refresh from server, but for now we'll just update state
          setAtas(prev => prev.map(a => a.id === newAta.id ? { ...a, status: "Gerada", sessao_nome: newAta.sessao_nome } : a))
        }}
      />
    </div>
  )
}
