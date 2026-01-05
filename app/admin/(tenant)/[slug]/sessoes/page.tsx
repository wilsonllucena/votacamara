import { createClient } from "@/utils/supabase/server"
import { Pagination } from "@/components/admin/Pagination"
import { SessoesClient } from "@/components/admin/sessoes/SessoesClient"
import { Suspense } from "react"

const ITEMS_PER_PAGE = 10

export default async function SessoesPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ slug: string }> 
    searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const { slug } = await params
  const { page = "1", search = "", data: dataFilter } = await searchParams

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

  // 2. Build Query
  let query = supabase
    .from("sessoes")
    .select("*, pauta_itens(projeto_id)", { count: "exact" })
    .eq("camara_id", camara.id)
    .order("iniciou_em", { ascending: false })

  if (search) {
      query = query.ilike("titulo", `%${search}%`)
  }

  if (dataFilter && typeof dataFilter === "string") {
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

  const mappedSessoes = sessoes?.map(s => {
      return {
          ...s,
          // Extract date and time in a way that respects the stored timestamp
          data: s.iniciou_em.split('T')[0],
          hora: s.iniciou_em.split('T')[1].substring(0, 5),
          projeto_ids: s.pauta_itens?.map((p: any) => p.projeto_id) || []
      }
  })

  // 4. Get projects for association (status em_pauta or situation 'Em Pauta')
  const allProjectIdsInSessoes = mappedSessoes?.flatMap(s => s.projeto_ids) || []

  let projectsQuery = supabase
    .from("projetos")
    .select("id, titulo, numero, situacao")
    .eq("camara_id", camara.id)
  
  const filterParts = [
    "situacao.ilike.em_pauta"
  ]
  
  if (allProjectIdsInSessoes.length > 0) {
    filterParts.push(`id.in.(${allProjectIdsInSessoes.map(id => `"${id}"`).join(",")})`)
  }

  const { data: availableProjects } = await projectsQuery
    .or(filterParts.join(","))
    .order("numero", { ascending: true })

  // 5. Get projects already in other "active" sessions (agendada or aberta)
  const { data: busyProjects } = await supabase
    .from("pauta_itens")
    .select("projeto_id, sessao_id, sessoes!inner(status)")
    .in("sessoes.status", ["agendada", "aberta"])
    .eq("camara_id", camara.id)

  // 6. Get User Role for CASL
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
    <div className="py-6 space-y-6">
      <Suspense fallback={<div className="text-foreground">Carregando sessões...</div>}>
          <SessoesClient 
            sessoes={mappedSessoes || []} 
            slug={slug} 
            availableProjects={availableProjects || []}
            busyProjects={busyProjects?.map(bp => ({ projeto_id: bp.projeto_id, sessao_id: bp.sessao_id })) || []}
            pagination={{
                currentPage,
                totalPages
            }}
            rules={rules as any}
          />
      </Suspense>
    </div>
  )
}
