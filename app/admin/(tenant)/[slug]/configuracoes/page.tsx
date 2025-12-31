import { createClient } from "@/utils/supabase/server"
import { SettingsClient } from "@/components/admin/configuracoes/SettingsClient"

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: camara } = await supabase
    .from("camaras")
    .select("nome, telefone, cnpj, logo_url")
    .eq("slug", slug)
    .single()

  if (!camara) {
    return <div className="p-8 text-white">Câmara não encontrada</div>
  }

  return (
    <div className="py-6 px-4 md:px-8">
      <SettingsClient slug={slug} camara={camara} />
    </div>
  )
}
