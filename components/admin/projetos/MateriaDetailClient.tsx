"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    ArrowLeft, 
    User, 
    Tag, 
    FileText, 
    Edit2, 
    Calendar,
    Clock,
    History,
    Users
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createMongoAbility, RawRuleOf, MongoAbility } from "@casl/ability"
import { Action, Subject } from "@/lib/casl/ability"
import dynamic from "next/dynamic"

// Importar o visualizador de PDF dinamicamente com SSR desabilitado
const MateriaPdfViewer = dynamic(() => import("./MateriaPdfViewer"), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 space-y-4">
      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center animate-pulse">
        <FileText className="h-8 w-8" />
      </div>
      <p className="text-sm font-medium">Carregando visualizador...</p>
    </div>
  )
})

export interface Projeto {
  id: string
  numero: string
  titulo: string
  ementa: string
  texto_url?: string | null
  status: string
  created_at: string
  projeto_autores?: {
    vereadores: {
      id: string
      nome: string
      partido: string
    }
  }[]
  projeto_categorias?: {
    id: string
    nome: string
  } | null
  projeto_situacoes?: {
    id: string
    nome: string
  } | null
  tipos_materia?: {
    id: string
    nome: string
    sigla: string
  } | null
}

export interface MateriaDetailClientProps {
  projeto: Projeto
  slug: string
  rules: RawRuleOf<MongoAbility<[Action, Subject]>>[]
}

export function MateriaDetailClient({ projeto, slug, rules }: MateriaDetailClientProps) {
  const router = useRouter()
  
  // Reconstruir abilidade no cliente
  const ability = useMemo(() => createMongoAbility<[Action, Subject]>(rules), [rules])

  const authors = projeto.projeto_autores?.map(pa => pa.vereadores.nome).join(", ") || "Sem autor"
  const authorsIds = projeto.projeto_autores?.map(pa => pa.vereadores.id) || []

  // Verificar se pode editar (CASL)
  // Usamos o objeto projeto completo para a verificação de condições
  const canEdit = ability.can('update', { 
    ...projeto, 
    autores_ids: authorsIds 
  } as any)

  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      rascunho: "Rascunho",
      em_pauta: "Em Pauta",
      votado: "Votado",
      aprovado: "Aprovado",
      rejeitado: "Rejeitado",
    }
    return map[status] || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_pauta": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "votado": return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "aprovado": return "bg-green-500/10 text-green-500 border-green-500/20"
      case "rejeitado": return "bg-red-500/10 text-red-500 border-red-500/20"
      default: return "bg-muted text-muted-foreground border-border"
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* Top Header Bar */}
      <div className="h-16 border-b border-border bg-card/50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="h-4 w-[1px] bg-border mx-2" />
          <h1 className="text-lg font-bold truncate max-w-[400px]">
            {projeto.tipos_materia?.sigla} {projeto.numero} - {projeto.titulo}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {canEdit && (
            <Button 
                onClick={() => router.push(`/admin/${slug}/projetos?edit=${projeto.id}`)}
                variant="outline" 
                size="sm"
                className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
            >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar Matéria
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area: Side-by-Side */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Structured Info */}
        <div className="w-[450px] border-r border-border overflow-y-auto p-8 space-y-8 bg-card/10 custom-scrollbar">
          
          {/* Section: Identificação */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Identificação da Matéria</h3>
            <div className="space-y-4">
                <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" className={cn("px-3 py-1 font-bold", getStatusColor(projeto.status))}>
                            {projeto.projeto_situacoes?.nome || formatStatus(projeto.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5" suppressHydrationWarning>
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(projeto.created_at).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                    <p className="text-2xl font-black italic tracking-tighter text-foreground uppercase leading-none mb-2">
                        {projeto.tipos_materia?.nome || "Projeto"}
                    </p>
                    <p className="text-4xl font-extrabold text-primary tracking-tighter">
                        Nº {projeto.numero}
                    </p>
                </div>
            </div>
          </div>

          {/* Section: Autoria */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                Autoria
            </h3>
            <div className="p-5 bg-card border border-border rounded-2xl shadow-sm space-y-4">
                {projeto.projeto_autores?.map((pa, idx) => (
                    <div key={pa.vereadores.id} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-background border border-primary/20 shadow-sm">
                            {pa.vereadores.nome.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">{pa.vereadores.nome}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{pa.vereadores.partido}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* Section: Ementa */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                Ementa / Resumo
            </h3>
            <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
                <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                    {projeto.ementa}
                </p>
            </div>
          </div>

          {/* Section: Metadados Extras */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-muted/30 border border-border/50 rounded-xl space-y-1">
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Categoria</p>
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Tag className="h-3 w-3 text-primary" />
                    {projeto.projeto_categorias?.nome || "Geral"}
                </div>
             </div>
             <div className="p-4 bg-muted/30 border border-border/50 rounded-xl space-y-1">
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Última Atualização</p>
                <div className="flex items-center gap-2 text-xs font-bold text-foreground" suppressHydrationWarning>
                    <History className="h-3 w-3 text-primary" />
                    {new Date(projeto.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
             </div>
          </div>

        </div>

        {/* Right Panel: Integrated PDF Viewer */}
        <div className="flex-1 bg-zinc-900 overflow-hidden relative">
          {!projeto.texto_url ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                <FileText className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium">Nenhum anexo disponível para esta matéria.</p>
            </div>
          ) : (
            <div className="h-full w-full">
              <MateriaPdfViewer fileUrl={projeto.texto_url} />
            </div>
          )}
        </div>

      </div>

      <style jsx global>{`
        .custom-pdf-viewer .rpv-core__viewer {
          background-color: #18181b;
        }
        .custom-pdf-viewer .rpv-default-layout__body {
          background-color: #18181b;
        }
        .custom-pdf-viewer .rpv-core__inner-pages {
          background-color: #000;
        }
      `}</style>
    </div>
  )
}
