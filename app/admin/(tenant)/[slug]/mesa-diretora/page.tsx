import { createClient } from "@/utils/supabase/server"
import { getMesaDiretora } from "@/app/admin/_actions/mesa_diretora"
import { MesaDiretoraClient } from "@/components/admin/mesa-diretora/MesaDiretoraClient"

export default async function MesaDiretoraPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Get Camara ID
  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) {
    return <div className="text-foreground p-8">Câmara não encontrada</div>
  }

  // 2. Fetch Vereadores
  const { data: vereadores } = await supabase
    .from("vereadores")
    .select("id, nome, partido")
    .eq("camara_id", camara.id)
    .eq("ativo", true)
    .order("nome")

  // 3. Fetch Cargos
  const { data: cargos } = await supabase
    .from("cargos")
    .select("id, nome")
    .eq("camara_id", camara.id)
    .order("nome")

  // 4. Fetch Current Mesa Diretora
  const currentMembers = await getMesaDiretora(camara.id)

  return (
    <div className="space-y-6">
      <MesaDiretoraClient 
        slug={slug} 
        camaraId={camara.id} 
        vereadores={vereadores || []} 
        cargos={cargos || []}
        members={currentMembers || []} 
      />
    </div>
  )
}
