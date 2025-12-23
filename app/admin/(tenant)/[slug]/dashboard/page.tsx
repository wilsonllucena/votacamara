import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Gavel, CalendarDays } from "lucide-react"

export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
             <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
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
                    <div className="text-2xl font-bold text-foreground">15</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        +2 ativos nesta gestão
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
                    <div className="text-2xl font-bold text-foreground">127</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        12 aprovados este mês
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
                    <div className="text-2xl font-bold text-foreground">42</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        3 ordinárias, 1 extra
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
                    <div className="text-2xl font-bold text-foreground">19/12</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        14:00 - Plenário Principal
                    </p>
                </CardContent>
            </Card>
        </div>

        {/* Recent Activity Mockup */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 bg-card/50 border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-foreground">Sessões Recentes</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                   <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                       [Gráfico de Atividade Legislativa]
                   </div>
                </CardContent>
            </Card>
            <Card className="col-span-3 bg-card/50 border-border shadow-sm text-foreground">
                <CardHeader>
                    <CardTitle>Últimos Votos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1,2,3].map((i) => (
                             <div key={i} className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Votação PL 123/2024</p>
                                    <p className="text-sm text-muted-foreground">
                                        Aprovado por unanimidade
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-green-500">
                                    +12 votos
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
