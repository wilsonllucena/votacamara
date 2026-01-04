"use client"

import { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
    Search, 
    Calendar, 
    Download, 
    Users, 
    LayoutDashboard, 
    UserCheck,
    List,
    ChevronRight,
    PieChart as PieChartIcon,
    FileDown,
    FileSpreadsheet
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Legend, 
    Tooltip as RechartsTooltip 
} from "recharts"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Pagination } from "@/components/admin/Pagination"
import { PresencaDialog } from "./PresencaDialog"
import { exportToPDF, exportToExcel } from "@/lib/export-utils"

interface Session {
    id: string
    titulo: string
    tipo: string
    status: string
    iniciou_em: string
    stats: {
        presente: number
        ausente: number
        justificado: number
        total: number
    }
}

interface CouncilorStats {
    nome: string
    presente: number
    ausente: number
    justificado: number
    total: number
}

interface PresencasClientProps {
    slug: string
    camaraId: string
    camaraName: string
    initialSessions: Session[]
    count: number
    totalPages: number
    globalStats: {
        overview: {
            presente: number
            ausente: number
            justificado: number
        }
        byCouncilor: CouncilorStats[]
    }
}

export function PresencasClient({ 
    slug, 
    camaraId,
    camaraName,
    initialSessions, 
    count, 
    totalPages, 
    globalStats
}: PresencasClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Dialog State
    const [selectedSession, setSelectedSession] = useState<Session | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    
    // Filters State
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
    const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "2025")
    const [selectedType, setSelectedType] = useState(searchParams.get("type") || "")

    const currentPage = parseInt(searchParams.get("page") || "1")

    // Visualization Tab
    const [activeTab, setActiveTab] = useState("overview")

    // Charts Data
    const pieData = useMemo(() => [
        { name: 'Presente', value: globalStats.overview.presente, color: '#10b981' },
        { name: 'Ausente', value: globalStats.overview.ausente, color: '#ef4444' },
        { name: 'Justificado', value: globalStats.overview.justificado, color: '#f59e0b' },
    ].filter(d => d.value > 0), [globalStats.overview])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams(searchParams.toString())
        if (searchTerm) params.set("search", searchTerm)
        else params.delete("search")
        
        if (selectedYear) params.set("year", selectedYear)
        if (selectedType) params.set("type", selectedType)
        
        params.set("page", "1")
        router.push(`?${params.toString()}`)
    }

    const formatRate = (part: number, total: number) => {
        if (total === 0) return 0
        return Math.round((part / total) * 100)
    }

    const handleExport = (format: 'pdf' | 'excel') => {
        const columns = ["Nome do Parlamentar", "Presente", "Ausente", "Justificado", "% Presença"]
        const rows = globalStats.byCouncilor.map(c => [
            c.nome,
            c.presente,
            c.ausente,
            c.justificado,
            `${formatRate(c.presente, c.total)}%`
        ])

        const exportData = {
            title: "Relatório Consolidado de Presidência",
            camaraName: camaraName,
            date: `Período: ${selectedYear}${selectedType ? ` - ${selectedType}` : ''}`,
            columns,
            rows,
            fileName: `PresencaConsolidada_${camaraName.replace(/\s/g, '_')}_${selectedYear}`
        }

        if (format === 'pdf') exportToPDF(exportData)
        else exportToExcel(exportData)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section with Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total de Sessões</p>
                        <h3 className="text-2xl font-black">{count}</h3>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Média de Presença</p>
                        <h3 className="text-2xl font-black">
                            {formatRate(globalStats.overview.presente, globalStats.overview.presente + globalStats.overview.ausente + globalStats.overview.justificado)}%
                        </h3>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <form onSubmit={handleSearch} className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center gap-4 shadow-sm">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar sessão..."
                        className="w-full bg-muted/50 border border-transparent rounded-xl pl-10 pr-4 py-2 text-sm focus:bg-background focus:border-primary/50 outline-none transition-all"
                    />
                </div>
                
                <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-muted/50 border border-transparent rounded-xl px-4 py-2 text-sm outline-none focus:bg-background focus:border-primary/50"
                >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                </select>

                <select 
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="bg-muted/50 border border-transparent rounded-xl px-4 py-2 text-sm outline-none focus:bg-background focus:border-primary/50"
                >
                    <option value="">Todos os Tipos</option>
                    <option value="ordinaria">Ordinária</option>
                    <option value="extraordinaria">Extraordinária</option>
                </select>

                <Button type="submit" className="rounded-xl px-6 font-bold uppercase tracking-widest text-[10px]">
                    Filtrar
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="rounded-xl border-dashed border-primary/30 text-primary font-bold uppercase tracking-widest text-[10px] ml-auto">
                            <Download className="w-3.5 h-3.5 mr-2" /> Exportar Relatório
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-border bg-card">
                        <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2 font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                            <FileDown className="w-4 h-4 text-red-500" /> Baixar em PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-2 font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                            <FileSpreadsheet className="w-4 h-4 text-green-500" /> Baixar em Excel
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Session List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-primary/5 border-b border-border p-4 flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2">
                                <List className="w-4 h-4 text-primary" /> Sessões Recentes
                            </h3>
                            <span className="text-[10px] uppercase font-black text-muted-foreground">{initialSessions.length} sessões listadas</span>
                        </div>
                        <div className="divide-y divide-border">
                            {initialSessions.length === 0 ? (
                                <div className="p-12 text-center text-muted-foreground italic">Nenhuma sessão encontrada.</div>
                            ) : (
                                initialSessions.map((session) => (
                                    <div key={session.id} className="group p-5 hover:bg-muted/30 transition-all flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-primary/5 border-primary/20 text-[10px] uppercase font-bold tracking-tighter">
                                                    {session.tipo}
                                                </Badge>
                                                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{session.titulo}</h4>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                                <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {session.iniciou_em ? format(new Date(session.iniciou_em), "dd/MM/yyyy", { locale: ptBR }) : "--/--/----"}</span>
                                                <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {session.stats.presente} presentes</span>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => {
                                                setSelectedSession(session)
                                                setIsDialogOpen(true)
                                            }}
                                            className="group-hover:bg-primary group-hover:text-primary-foreground font-bold text-[10px] uppercase rounded-xl transition-all"
                                        >
                                            Ver Lista <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} />
                </div>

                {/* Right Side: Charts & Stats */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden sticky top-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="w-full grid grid-cols-2 h-14 bg-muted/30 rounded-none border-b border-border p-1">
                                <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <PieChartIcon className="w-4 h-4 mr-2" /> Geral
                                </TabsTrigger>
                                <TabsTrigger value="councilors" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <Users className="w-4 h-4 mr-2" /> Por Nome
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip 
                                                contentStyle={{ backgroundColor: '#1f2937', borderRadius: '12px', border: 'none', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                
                                <div className="space-y-3">
                                    {pieData.map(d => (
                                        <div key={d.name} className="flex items-center justify-between text-sm font-bold">
                                            <span className="flex items-center gap-2 text-muted-foreground">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                                {d.name}
                                            </span>
                                            <span>{formatRate(d.value, globalStats.overview.presente + globalStats.overview.ausente + globalStats.overview.justificado)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="councilors" className="p-6 space-y-6 max-h-[500px] overflow-y-auto animate-in slide-in-from-left-4 duration-500">
                                {globalStats.byCouncilor.map((councilor) => {
                                    const pRate = formatRate(councilor.presente, councilor.total)
                                    const aRate = formatRate(councilor.ausente, councilor.total)
                                    const jRate = formatRate(councilor.justificado, councilor.total)
                                    
                                    return (
                                        <div key={councilor.nome} className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                                                <span>{councilor.nome}</span>
                                                <span className="text-primary">{pRate}%</span>
                                            </div>
                                            {/* Stacked Multi-color Progress bar */}
                                            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden flex">
                                                {pRate > 0 && <div className="h-full bg-green-500 transition-all" style={{ width: `${pRate}%` }} title={`Presente: ${pRate}%`} />}
                                                {aRate > 0 && <div className="h-full bg-red-500 transition-all" style={{ width: `${aRate}%` }} title={`Ausente: ${aRate}%`} />}
                                                {jRate > 0 && <div className="h-full bg-amber-500 transition-all" style={{ width: `${jRate}%` }} title={`Justificado: ${jRate}%`} />}
                                            </div>
                                        </div>
                                    )
                                })}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            <PresencaDialog 
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false)
                    setSelectedSession(null)
                    router.refresh()
                }}
                session={selectedSession}
                slug={slug}
                camaraId={camaraId}
                camaraName={camaraName}
            />
        </div>
    )
}
