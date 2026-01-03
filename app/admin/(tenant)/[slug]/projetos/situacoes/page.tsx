import { getSituacoes } from "@/app/admin/_actions/situacoes"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { SituacoesClient } from "@/components/admin/projetos/SituacoesClient"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

const ITEMS_PER_PAGE = 10

export default async function SituacoesPage({ 
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

  // Buscar situações da câmara
  let query = supabase
    .from("projeto_situacoes")
    .select("*", { count: "exact" })
    .eq("camara_id", camara.id)
    .order("nome", { ascending: true })

  if (search) {
    query = query.or(`nome.ilike.%${search}%,label.ilike.%${search}%`)
  }

  const { data: situacoes, count } = await query.range(from, to)
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1

  return (
    <div className="container mx-auto py-4">
      <SituacoesClient 
        slug={slug} 
        situacoes={(situacoes as any[]) || []} 
        pagination={{
            currentPage,
            totalPages
        }}
      />
    </div>
  )
}
