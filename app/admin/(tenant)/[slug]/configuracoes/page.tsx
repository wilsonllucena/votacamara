import { createClient } from "@/utils/supabase/server"
import { SettingsClient } from "@/components/admin/configuracoes/SettingsClient"

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user?.id)
    .single()

  const { data: camara } = await supabase
    .from("camaras")
    .select("nome, telefone, cnpj, logo_url, endereco, cidade, uf")
    .eq("slug", slug)
    .single()

  if (!camara) {
    return <div className="p-8 text-white">Câmara não encontrada</div>
  }

  const { defineAbilityFor } = await import("@/lib/casl/ability")
  const ability = defineAbilityFor(profile?.role || 'PUBLICO')
  const rules = ability.rules

  return (
    <div className="py-6 px-4 md:px-8">
      <SettingsClient 
        slug={slug} 
        camara={camara} 
        userRole={profile?.role || 'USER'} 
        rules={rules as any}
      />
    </div>
  )
}
