import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Gavel, CalendarDays } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

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
  // Join votacoes with projetos and get votes summary
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
    
    const projeto = Array.isArray(v.projetos) ? v.projetos[0] : v.projetos

    return {
      id: v.id,
      titulo: `${projeto?.titulo || 'Projeto'} ${projeto?.numero || ''}`,
      resultado: isUnânime ? "Aprovado por unanimidade" : votosSim > (totalVotos / 2) ? "Aprovado" : "Reprovado",
      totalVotos
    }
  }) || []

  const nextSessionDate = proximaSessaoData?.iniciou_em 
    ? format(new Date(proximaSessaoData.iniciou_em), "dd/MM", { locale: ptBR })
    : "--/--"
  
  const nextSessionTime = proximaSessaoData?.iniciou_em 
    ? format(new Date(proximaSessaoData.iniciou_em), "HH:mm", { locale: ptBR })
    : "Sem previsão"

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
             <h2 className="text-3xl font-bold tracking-tight text-foreground">Cockpit</h2>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card/50 border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total de Vereadores
                    </CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">{totalVereadores || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Ativos nesta gestão
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-card/50 border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Projetos Votados
                    </CardTitle>
                    <FileText className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">{totalProjetosVotados || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Total acumulado
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-card/50 border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Sessões Realizadas
                    </CardTitle>
                    <Gavel className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">{totalSessoesRealizadas || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Sessões encerradas
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-card/50 border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Próxima Sessão
                    </CardTitle>
                    <CalendarDays className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">{nextSessionDate}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {nextSessionTime} {proximaSessaoData?.titulo ? `- ${proximaSessaoData.titulo}` : ''}
                    </p>
                </CardContent>
            </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 bg-card/50 border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-foreground">Sessões Recentes</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                   <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                       [Gráfico de Atividade Legislativa em breve]
                   </div>
                </CardContent>
            </Card>
            <Card className="col-span-3 bg-card/50 border-border shadow-sm text-foreground">
                <CardHeader>
                    <CardTitle>Últimos Votos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {processedVotacoes.length > 0 ? processedVotacoes.map((v) => (
                             <div key={v.id} className="flex items-center">
                                <div className="ml-0 space-y-1">
                                    <p className="text-sm font-medium leading-none text-foreground">{v.titulo}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {v.resultado}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-green-500">
                                    +{v.totalVotos} votos
                                </div>
                            </div>
                        )) : (
                            <div className="text-sm text-muted-foreground text-center py-8">
                                Nenhuma votação recente encontrada
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}


