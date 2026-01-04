import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import { ProjetosClient } from "@/components/admin/projetos/ProjetosClient"
import { getTiposMateria } from "@/app/admin/_actions/projetos"

const ITEMS_PER_PAGE = 10

export default async function ProjetosPage({ 
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
      return <div className="text-white p-8">Câmara não encontrada</div>
  }

  // 2. Fetch Active Vereadores for the form
  const { data: vereadores } = await supabase
    .from("vereadores")
    .select("id, nome, partido")
    .eq("camara_id", camara.id)
    .eq("ativo", true)
    .order("nome")

  // 3. Fetch Categories (Global + Chamber)
  const { data: categorias } = await supabase
    .from("projeto_categorias")
    .select("id, nome")
    .or(`camara_id.is.null,camara_id.eq.${camara.id}`)
    .order("nome")

  // 4. Fetch Situations (Global + Chamber)
  const { data: situacoes } = await supabase
    .from("projeto_situacoes")
    .select("id, nome")
    .or(`camara_id.is.null,camara_id.eq.${camara.id}`)
    .order("nome")

  // 4.5 Fetch All Tipos de Materia
  const tiposMateria = await getTiposMateria()

  // 5. Query Materias (Projetos) with authors, category and situation
  const currentPage = Number(page) || 1
  const from = (currentPage - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  let query = supabase
    .from("projetos")
    .select(`
      *,
      projeto_categorias (
        id,
        nome
      ),
      projeto_situacoes (
        id,
        nome
      ),
      projeto_autores (
        vereadores (
          id,
          nome,
          partido
        )
      ),
      tipos_materia (
        id,
        nome,
        sigla
      )
    `, { count: "exact" })
    .eq("camara_id", camara.id)
    .order("created_at", { ascending: false })

  if (search) {
      query = query.or(`titulo.ilike.%${search}%,numero.ilike.%${search}%`)
  }

  const { data: projetos, count } = await query.range(from, to)

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1

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
    <div className="py-6">
      <Suspense fallback={<div className="text-white">Carregando materias...</div>}>
          <ProjetosClient 
            projetos={(projetos as any) || []} 
            slug={slug} 
            vereadores={vereadores || []}
            categorias={categorias || []}
            situacoes={situacoes || []}
            tiposMateria={tiposMateria || []}
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
