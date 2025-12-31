import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import { ProjetosClient } from "@/components/admin/projetos/ProjetosClient"

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

  // 3. Query Materias (Projetos) with authors
  const currentPage = Number(page) || 1
  const from = (currentPage - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  let query = supabase
    .from("projetos")
    .select(`
      *,
      projeto_autores (
        vereadores (
          id,
          nome,
          partido
        )
      )
    `, { count: "exact" })
    .eq("camara_id", camara.id)
    .order("created_at", { ascending: false })

  if (search) {
      query = query.or(`titulo.ilike.%${search}%,numero.ilike.%${search}%`)
  }

  const { data: projetos, count } = await query.range(from, to)

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1

  return (
    <div className="py-6">
      <Suspense fallback={<div className="text-white">Carregando materias...</div>}>
          <ProjetosClient 
            projetos={(projetos as any) || []} 
            slug={slug} 
            vereadores={vereadores || []}
            pagination={{
                currentPage,
                totalPages
            }}
          />
      </Suspense>
    </div>
  )
}
