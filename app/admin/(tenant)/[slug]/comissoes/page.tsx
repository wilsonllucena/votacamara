import { ComissoesClient } from "@/components/admin/comissoes/ComissoesClient"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

const ITEMS_PER_PAGE = 10

export default async function ComissoesPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ slug: string }> 
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const { page = "1", search = "" } = await searchParams
  const supabase = await createClient()

  // 1. Get Camara ID
  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) {
    redirect("/admin/dashboard")
  }

  // 2. Paginação
  const currentPage = Number(page) || 1
  const from = (currentPage - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  // 3. Buscar comissões
  let comissoesQuery = supabase
    .from("comissoes")
    .select("*, comissao_membros(id, cargo, vereadores(id, nome))", { count: "exact" })
    .eq("camara_id", camara.id)
    .order("nome", { ascending: true })

  if (search) {
    comissoesQuery = comissoesQuery.ilike("nome", `%${search}%`)
  }

  const { data: comissoes, count } = await comissoesQuery.range(from, to)
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1

  // 4. Buscar vereadores para seleção (ativos e não executivos para membros)
  const { data: vereadores } = await supabase
    .from("vereadores_view")
    .select("id, nome, partido")
    .eq("camara_id", camara.id)
    .eq("ativo", true)
    .eq("is_executivo", false)
    .order("nome", { ascending: true })

  // 5. Buscar matérias para seleção (opcional, se o formulário pedir)
  const { data: materias } = await supabase
    .from("projetos")
    .select("id, numero, titulo")
    .eq("camara_id", camara.id)
    .order("created_at", { ascending: false })

  // 6. Fetch Role and Define Abilities
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user?.id)
      .single()

  const { defineAbilityFor } = await import("@/lib/casl/ability")
  const ability = defineAbilityFor(profile?.role || 'PUBLICO')
  const rules = ability.rules

  return (
    <div className="container mx-auto py-4">
      <ComissoesClient 
        slug={slug} 
        initialComissoes={(comissoes as any[]) || []} 
        vereadores={vereadores || []}
        materias={materias || []}
        pagination={{
            currentPage,
            totalPages
        }}
        rules={rules as any}
      />
    </div>
  )
}
