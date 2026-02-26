import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Users, FileText, Gavel, CalendarDays, Plus, FileBarChart, Clock, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge" 
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { DashboardCharts } from "./dashboard-charts"

export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Get Chamber ID
  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) {
    return <div>Câmara não encontrada</div>
  }

  const camaraId = camara.id

  // 2. Fetch Stats
  const [
    { count: totalVereadores },
    { count: totalProjetosVotados },
    { count: totalSessoesRealizadas },
    { data: proximaSessaoData }
  ] = await Promise.all([
    supabase.from("vereadores").select("*", { count: 'exact', head: true }).eq("camara_id", camaraId).eq("ativo", true),
    supabase.from("projetos").select("*", { count: 'exact', head: true }).eq("camara_id", camaraId).eq("status", "votado"),
    supabase.from("sessoes").select("*", { count: 'exact', head: true }).eq("camara_id", camaraId).eq("status", "encerrada"),
    supabase.from("sessoes").select("*").eq("camara_id", camaraId).eq("status", "aberta").order("iniciou_em", { ascending: true }).limit(1).single()
  ])

  // 3. Fetch Recent Votings
  const { data: ultimasVotacoes } = await supabase
    .from("votacoes")
    .select(`
      id,
      status,
      encerrou_em,
      projetos (
        titulo,
        numero
      ),
      votos (
        valor
      )
    `)
    .eq("camara_id", camaraId)
    .eq("status", "encerrada")
    .order("encerrou_em", { ascending: false })
    .limit(3)

  const processedVotacoes = (ultimasVotacoes as any[])?.map(v => {
    const totalVotos = v.votos?.length || 0
    const votosSim = v.votos?.filter((vt: any) => vt.valor === 'SIM').length || 0
    const isUnânime = votosSim === totalVotos && totalVotos > 0
    
    // Status Logic
    let statusLabel = "Rejeitado"
    let statusVariant: "default" | "secondary" | "destructive" | "outline" = "destructive"
    
    if (isUnânime) {
        statusLabel = "Aprovado"
        statusVariant = "default" // or success if available, default is fine
    } else if (votosSim > (totalVotos / 2)) {
        statusLabel = "Aprovado"
        statusVariant = "secondary"
    }

    const projeto = Array.isArray(v.projetos) ? v.projetos[0] : v.projetos

    return {
      id: v.id,
      titulo: `${projeto?.titulo || 'Projeto'} ${projeto?.numero || ''}`,
      data: v.encerrou_em ? format(new Date(v.encerrou_em), "dd/MM/yyyy", { locale: ptBR }) : "",
      status: statusLabel,
      variant: statusVariant,
      totalVotos,
      votosSim,
      votosNao: totalVotos - votosSim
    }
  }) || []

  const nextSessionDate = proximaSessaoData?.iniciou_em 
    ? format(new Date(proximaSessaoData.iniciou_em), "dd MMM", { locale: ptBR })
    : "--"
  
  const nextSessionTime = proximaSessaoData?.iniciou_em 
    ? format(new Date(proximaSessaoData.iniciou_em), "HH:mm", { locale: ptBR })
    : ""

  return (
    <div className="space-y-8 pb-8">
        
        {/* Header */}
        <div className="flex flex-col space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Resumo Legislativo</h2>
            <p className="text-muted-foreground">
                Acompanhamento em tempo real das atividades da casa.
            </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            
            {/* Vereadores Card */}
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        +2 este mês
                    </Badge>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Total de Vereadores</div>
                    <div className="text-3xl font-bold text-foreground">{totalVereadores || 0}</div>
                    <p className="text-xs text-muted-foreground mt-2 border-t pt-2 border-border w-full">
                        Ativos na legislatura atual
                    </p>
                </CardContent>
            </Card>

            {/* Projetos Card */}
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Total Acumulado</span>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Projetos Votados</div>
                    <div className="text-3xl font-bold text-foreground mb-2">{totalProjetosVotados || 0}</div>
                    <Progress value={66} className="h-2 bg-secondary [&>div]:bg-primary" />
                </CardContent>
            </Card>

            {/* Sessões Card */}
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                         <Gavel className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Este ano</span>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Sessões Realizadas</div>
                    <div className="text-3xl font-bold text-foreground">{totalSessoesRealizadas || 0}</div>
                    <p className="text-xs text-muted-foreground mt-2 border-t pt-2 border-border">
                        Próxima meta: 50 sessões
                    </p>
                </CardContent>
            </Card>

            {/* Próxima Sessão Card */}
            <Card className="shadow-sm border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <div className="p-2 bg-primary/10 rounded-lg">
                        <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 uppercase text-[10px] font-bold tracking-wider border-0">
                        Agendado
                    </Badge>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Próxima Sessão</div>
                    <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                        {nextSessionDate}
                        <span className="text-lg font-normal text-muted-foreground">, {nextSessionTime}</span>
                    </div>
                     <p className="text-xs text-muted-foreground mt-2 border-t pt-2 border-border">
                        {proximaSessaoData?.titulo || "Ordinária #15"}
                    </p>
                </CardContent>
            </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            
            {/* Left Column (Chart) */}
            <div className="col-span-1 lg:col-span-4 space-y-6">
                <Card className="shadow-sm h-[400px]">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold text-foreground">Atividade Legislativa (Sessões)</CardTitle>
                        <div className="flex bg-secondary rounded-md p-0.5">
                             <Button variant="ghost" size="sm" className="h-7 text-xs bg-card shadow-sm text-foreground hover:bg-card rounded w-16">7 Dias</Button>
                             <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:bg-card hover:shadow-sm rounded w-16">30 Dias</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px] w-full">
                            <DashboardCharts />
                        </div>
                        <p className="text-center text-xs text-muted-foreground mt-4 italic">
                            Gráfico de desempenho legislativo das últimas semanas
                        </p>
                    </CardContent>
                </Card>

                {/* Nova Sessão CTA */}
                 <Card className="bg-primary text-primary-foreground border-0 shadow-lg overflow-hidden relative">
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                        <Gavel className="w-64 h-64 rotate-12" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Nova Sessão Plenária</CardTitle>
                        <CardDescription className="text-primary-foreground/80 max-w-md">
                            Inicie a configuração de uma nova sessão extraordinária ou ordinária para pauta da semana.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold">
                            <Plus className="mr-2 h-4 w-4" /> Cadastrar Sessão
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column (Votes & Reports) */}
            <div className="col-span-1 lg:col-span-3 space-y-6">
                
                {/* Recent Votes */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold text-foreground">Últimos Votos</CardTitle>
                        <Button variant="link" className="text-primary font-semibold p-0 h-auto">Ver todos</Button>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-6">
                            {processedVotacoes.length > 0 ? processedVotacoes.map((v) => (
                                <div key={v.id} className="flex flex-col space-y-2 border-b border-border last:border-0 pb-4 last:pb-0">
                                    <div className="flex items-start justify-between">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            {v.titulo.split(' ')[0]} {v.titulo.split(' ')[1]}
                                        </span>
                                         <Badge variant={v.variant} className={
                                            v.variant === 'default' ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                            v.variant === 'secondary' ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary" :
                                            "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive"
                                        }>
                                            {v.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <p className="text-sm font-medium text-foreground line-clamp-2">
                                        {v.titulo} (Descrição/Ementa indisponível no mock)
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Há 2 horas
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {v.votosSim} Sim / {v.votosNao} Não
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-sm text-muted-foreground text-center py-8 flex flex-col items-center">
                                    <AlertCircle className="w-8 h-8 opacity-50 mb-2" />
                                    Nenhuma votação recente encontrada
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                 {/* Reports Card */}
                <Card className="shadow-sm">
                    <CardHeader>
                         <CardTitle className="text-lg font-bold text-foreground">Relatórios Mensais</CardTitle>
                         <CardDescription>
                            Exporte todos os dados de presença e votação consolidados deste mês.
                         </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                         <Button variant="outline" className="w-full justify-center">
                            <FileBarChart className="mr-2 h-4 w-4" /> Gerar PDF
                        </Button>
                         <div className="ml-4 w-12 h-12 bg-secondary rounded-lg flex items-end justify-center pb-2 gap-1 animate-pulse">
                            <div className="w-1.5 h-3 bg-muted-foreground/30 rounded-t"></div>
                            <div className="w-1.5 h-5 bg-muted-foreground/30 rounded-t"></div>
                            <div className="w-1.5 h-2 bg-muted-foreground/30 rounded-t"></div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    </div>
  )
}
