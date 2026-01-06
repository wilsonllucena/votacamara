"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
    FileText, 
    Download, 
    Calendar, 
    Search, 
    Loader2, 
    FileDown, 
    History,
    FileCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { generateSessionReportAction, generateMatterReportAction } from "@/app/admin/_actions/relatorios"

interface RelatoriosClientProps {
    sessoes: any[]
    slug: string
    camara: any
    userRole: string
}

export function RelatoriosClient({ sessoes, slug, camara, userRole }: RelatoriosClientProps) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [isGenerating, setIsGenerating] = useState<string | null>(null)

    const filteredSessoes = sessoes.filter(s => 
        s.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleGenerateSessionReport = async (sessaoId: string) => {
        setIsGenerating(`sessao-${sessaoId}`)
        try {
            const result = await generateSessionReportAction(slug, sessaoId)
            if (result.error) alert(result.error)
            else router.refresh()
        } catch (error) {
            console.error(error)
            alert("Erro ao gerar relatório")
        } finally {
            setIsGenerating(null)
        }
    }

    const handleGenerateMatterReport = async (sessaoId: string, materiaId: string) => {
        setIsGenerating(`materia-${materiaId}`)
        try {
            const result = await generateMatterReportAction(slug, sessaoId, materiaId)
            if (result.error) alert(result.error)
            else router.refresh()
        } catch (error) {
            console.error(error)
            alert("Erro ao gerar relatório")
        } finally {
            setIsGenerating(null)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Relatórios Legislativos</h1>
                    <p className="text-muted-foreground text-sm">Gere e gerencie os relatórios oficiais de votação e presença.</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar sessão por título..."
                        className="w-full bg-muted/50 border border-transparent rounded-lg pl-10 pr-4 py-2 text-sm focus:bg-background focus:border-primary/50 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black tracking-widest">Sessão / Data</th>
                                <th className="px-6 py-4 text-[10px] font-black tracking-widest">Relatório da Sessão</th>
                                {/* <th className="px-6 py-4 text-[10px] font-black tracking-widest">Relatórios por Matéria</th> */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredSessoes.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground italic">
                                        Nenhuma sessão encontrada.
                                    </td>
                                </tr>
                            ) : (
                                filteredSessoes.map((sessao) => {
                                    const sessaoReport = sessao.relatorios_sessao?.find((r: any) => r.tipo === 'SESSAO')
                                    
                                    return (
                                        <tr key={sessao.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-foreground">{sessao.titulo}</span>
                                                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(sessao.iniciou_em), "dd/MM/yyyy", { locale: ptBR })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {sessaoReport ? (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-8 rounded-lg bg-green-500/5 text-green-600 border-green-500/20 hover:bg-green-500/10 font-bold text-[10px] uppercase tracking-wider"
                                                        onClick={() => window.open(sessaoReport.url_pdf, '_blank')}
                                                    >
                                                        <Download className="w-3.5 h-3.5 mr-2" /> Baixar Consolidado
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        disabled={isGenerating === `sessao-${sessao.id}`}
                                                        className="h-8 rounded-lg text-primary hover:bg-primary/10 font-bold text-[10px] uppercase tracking-wider"
                                                        onClick={() => handleGenerateSessionReport(sessao.id)}
                                                    >
                                                        {isGenerating === `sessao-${sessao.id}` ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                                                        ) : (
                                                            <History className="w-3.5 h-3.5 mr-2" />
                                                        )}
                                                        Gerar Relatório
                                                    </Button>
                                                )}
                                            </td>
                                            {/* <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {sessao.pauta_itens?.map((pauta: any) => {
                                                        const materiaReport = sessao.relatorios_sessao?.find(
                                                            (r: any) => r.tipo === 'MATERIA' && r.materia_id === pauta.projeto_id
                                                        )
                                                        
                                                        return (
                                                            <DropdownMenu key={pauta.projeto_id}>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm"
                                                                        className={cn(
                                                                            "h-8 rounded-lg font-bold text-[10px] uppercase tracking-tight",
                                                                            materiaReport ? "bg-indigo-500/5 text-indigo-600 border-indigo-500/20" : "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        {materiaReport ? <FileCheck className="w-3.5 h-3.5 mr-1" /> : <FileDown className="w-3.5 h-3.5 mr-1" />}
                                                                        {pauta.projetos.numero}
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl bg-card border-border">
                                                                    <div className="px-2 py-1.5 mb-2 border-b border-border">
                                                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-0.5">Matéria</p>
                                                                        <p className="text-[11px] font-bold text-foreground leading-tight truncate">{pauta.projetos.titulo}</p>
                                                                    </div>
                                                                    {materiaReport ? (
                                                                        <DropdownMenuItem 
                                                                            onClick={() => window.open(materiaReport.url_pdf, '_blank')}
                                                                            className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest text-green-600 cursor-pointer rounded-lg px-3 py-2"
                                                                        >
                                                                            <Download className="w-4 h-4" /> Baixar PDF
                                                                        </DropdownMenuItem>
                                                                    ) : (
                                                                        <DropdownMenuItem 
                                                                            disabled={isGenerating === `materia-${pauta.projeto_id}`}
                                                                            onClick={() => handleGenerateMatterReport(sessao.id, pauta.projeto_id)}
                                                                            className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest text-primary cursor-pointer rounded-lg px-3 py-2"
                                                                        >
                                                                            {isGenerating === `materia-${pauta.projeto_id}` ? (
                                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                            ) : (
                                                                                <History className="w-4 h-4" />
                                                                            )}
                                                                            Gerar Relatório
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )
                                                    })}
                                                </div>
                                            </td> */}
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
