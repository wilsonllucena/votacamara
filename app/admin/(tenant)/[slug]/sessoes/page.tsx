import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Gavel, Calendar, Clock, MonitorPlay } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { SessoesFilter } from "@/components/admin/SessoesFilter"
import { Pagination } from "@/components/admin/Pagination"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

const ITEMS_PER_PAGE = 10

export default async function SessoesPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ slug: string }> 
    searchParams: Promise<{ [key: string]: string | string[] | undefined }> // Updated type for Next.js 15+
}) {
  const { slug } = await params
  const { page = "1", data: dataFilter } = await searchParams // Await searchParams

  const supabase = await createClient()

  // 1. Get Camara ID
  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) {
      return <div className="text-white">Câmara não encontrada</div>
  }

  // 2. Build Query
  let query = supabase
    .from("sessoes")
    .select("*", { count: "exact" })
    .eq("camara_id", camara.id)
    .order("iniciou_em", { ascending: false })

  if (dataFilter && typeof dataFilter === "string") {
      // Filter by day (ignoring time)
      // Range: dataFilter 00:00:00 to dataFilter 23:59:59
      query = query
        .gte("iniciou_em", `${dataFilter}T00:00:00`)
        .lte("iniciou_em", `${dataFilter}T23:59:59`)
  }

  // 3. Pagination
  const currentPage = Number(page) || 1
  const from = (currentPage - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const { data: sessoes, count } = await query.range(from, to)

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1

  return (
    <div className="space-y-6">
       {/* Actions Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
         <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Sessões Plenárias</h2>
            <p className="text-slate-400">Gerencie e inicie as sessões de votação.</p>
         </div>
         <div className="flex gap-3 w-full md:w-auto">
             <SessoesFilter />
             <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-blue-500/50 flex-1 md:flex-none">
                <Plus className="mr-2 h-4 w-4" /> Nova Sessão
            </Button>
         </div>
      </div>

      {/* Grid */}
      {!sessoes || sessoes.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-500">
              Nenhuma sessão encontrada.
          </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessoes.map((sessao) => {
                const date = new Date(sessao.iniciou_em)
                const formattedDate = format(date, "dd/MM/yyyy", { locale: ptBR })
                const formattedTime = format(date, "HH:mm", { locale: ptBR })

                return (
                <div key={sessao.id} className="group relative bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 transition-all shadow-lg shadow-blue-900/5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center text-blue-500 group-hover:text-white group-hover:bg-blue-500 transition-colors">
                            <Gavel className="h-5 w-5" />
                        </div>
                        <Badge variant={sessao.status === "agendada" ? "default" : "secondary"} className={
                            sessao.status === "agendada" 
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20" 
                            : "bg-slate-500/10 text-slate-500 border-slate-500/20 uppercase"
                        }>
                            {sessao.status}
                        </Badge>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{sessao.titulo}</h3>
                    <p className="text-sm text-slate-400 mb-4 capitalize">{sessao.tipo}</p>

                    <div className="space-y-2 text-sm text-slate-500 mb-6">
                        <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            {formattedDate}
                        </div>
                        <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            {formattedTime}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link href={`/admin/${slug}/sessoes/${sessao.id}/pauta`} className="w-full">
                            <Button className="w-full bg-slate-950 border border-slate-700 hover:bg-slate-800 text-white">
                                Pauta
                            </Button>
                        </Link>
                        {sessao.status === "agendada" && (
                            <Button className="w-full bg-green-600 hover:bg-green-500 text-white border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                                <MonitorPlay className="mr-2 h-4 w-4" /> Iniciar
                            </Button>
                        )}
                    </div>
                </div>
                )
            })}
        </div>
      )}
      
      {totalPages > 1 && (
          <Pagination totalPages={totalPages} currentPage={currentPage} />
      )}
    </div>
  )
}
