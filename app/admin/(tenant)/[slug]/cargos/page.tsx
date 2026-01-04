import { createClient } from "@/utils/supabase/server"
import { CargosClient } from "@/components/admin/cargos/CargosClient"

const ITEMS_PER_PAGE = 10

export default async function CargosPage({ 
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
      return <div className="text-foreground p-8">Câmara não encontrada</div>
  }

  // 2. Query
  const currentPage = Number(page) || 1
  const from = (currentPage - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  let query = supabase
    .from("cargos")
    .select("*", { count: "exact" })
    .eq("camara_id", camara.id)
    .order("nome", { ascending: true })

  if (search) {
    query = query.ilike("nome", `%${search}%`)
  }

  const { data: cargos, count, error: queryError } = await query.range(from, to)
  
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1

  // 3. Fetch Role and Define Abilities
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
    <div className="space-y-6">
      <CargosClient 
        cargos={cargos || []} 
        slug={slug} 
        pagination={{
            currentPage,
            totalPages
        }}
        rules={rules as any}
      />
    </div>
  )
}
