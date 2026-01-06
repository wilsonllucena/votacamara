import { createClient } from "@/utils/supabase/server"
import { RelatoriosClient } from "@/components/admin/sessoes/RelatoriosClient"
import { Suspense } from "react"

export default async function RelatoriosPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ slug: string }> 
    searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const { slug } = await params
  const { page = "1" } = await searchParams

  const supabase = await createClient()

  // 1. Get Camara ID and Logo
  const { data: camara } = await supabase
    .from("camaras")
    .select("id, nome, logo_url")
    .eq("slug", slug)
    .single()

  if (!camara) {
      return <div className="text-white p-6">Câmara não encontrada</div>
  }

  // 2. Get Sessions with their pauta items and existing reports
  const { data: sessoes } = await supabase
    .from("sessoes")
    .select(`
        *,
        relatorios_sessao(*),
        pauta_itens(
            projeto_id,
            projetos(id, titulo, numero)
        )
    `)
    .eq("camara_id", camara.id)
    .order("iniciou_em", { ascending: false })

  // 3. Get User Role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user?.id)
      .single()

  return (
    <div className="py-6 space-y-6">
      <Suspense fallback={<div className="text-foreground">Carregando relatórios...</div>}>
          <RelatoriosClient 
            sessoes={sessoes || []} 
            slug={slug} 
            camara={camara}
            userRole={profile?.role || 'PUBLICO'}
          />
      </Suspense>
    </div>
  )
}
