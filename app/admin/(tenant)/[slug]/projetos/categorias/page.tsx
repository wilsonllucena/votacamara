import { createClient } from "@/utils/supabase/server"
import { CategoriasClient } from "@/components/admin/projetos/CategoriasClient"
import { redirect } from "next/navigation"

const ITEMS_PER_PAGE = 10

export default async function CategoriasPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ slug: string }> 
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const { page = "1", search = "" } = await searchParams
  const supabase = await createClient()

  // Buscar ID da câmara
  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) {
    redirect("/admin/dashboard")
  }

  // Paginação
  const currentPage = Number(page) || 1
  const from = (currentPage - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  // Buscar categorias da câmara e globais
  let query = supabase
    .from("projeto_categorias")
    .select("*", { count: "exact" })
    .or(`camara_id.is.null,camara_id.eq.${camara.id}`)
    .order("nome", { ascending: true })

  if (search) {
    query = query.ilike("nome", `%${search}%`)
  }

  const { data: categorias, count } = await query.range(from, to)
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1

  return (
    <div className="container mx-auto py-4">
      <CategoriasClient 
        slug={slug} 
        categorias={categorias || []} 
        pagination={{
            currentPage,
            totalPages
        }}
      />
    </div>
  )
}
