import { createClient } from "@/utils/supabase/server"
import { CategoriasClient } from "@/components/admin/projetos/CategoriasClient"
import { redirect } from "next/navigation"

export default async function CategoriasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
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

  // Buscar categorias da câmara
  const { data: categorias } = await supabase
    .from("projeto_categorias")
    .select("*")
    .eq("camara_id", camara.id)
    .order("nome", { ascending: true })

  return (
    <div className="container mx-auto py-4">
      <CategoriasClient slug={slug} categorias={categorias || []} />
    </div>
  )
}
