import { createClient } from "@/utils/supabase/server"
import { AgendaScheduler } from "@/components/admin/agenda/AgendaScheduler"

export default async function AgendaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Get Camara ID
  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) {
      return <div className="text-white p-6">Câmara não encontrada</div>
  }

  // 2. Fetch all sessoes for the calendar including pauta_itens and projetos
  const { data: sessoes } = await supabase
    .from("sessoes")
    .select("*, pauta_itens(projeto_id, projetos(id, titulo, numero))")
    .eq("camara_id", camara.id)
    .order("iniciou_em", { ascending: true })

  return (
    <div className="py-6 space-y-6">
      <div className="flex justify-between items-center px-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Agenda Legislativa</h1>
          <p className="text-zinc-500">Acompanhe as sessões e projetos em pauta.</p>
        </div>
      </div>

      <AgendaScheduler initialSessoes={sessoes || []} />
    </div>
  )
}
