import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, User, ScrollText } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { Pagination } from "@/components/admin/Pagination"
import Link from "next/link"

const ITEMS_PER_PAGE = 10

export default async function ProjetosPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ slug: string }> 
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const { page = "1" } = await searchParams

  const supabase = await createClient()

  // 1. Get Camara ID
  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) {
      return <div className="text-white">Câmara não encontrada</div>
  }

  // 2. Query
  const currentPage = Number(page) || 1
  const from = (currentPage - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const { data: projetos, count } = await supabase
    .from("projetos")
    .select("*", { count: "exact" })
    .eq("camara_id", camara.id)
    .order("created_at", { ascending: false })
    .range(from, to)

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1

  return (
    <div className="space-y-6">
       {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Projetos de Lei</h2>
            <p className="text-zinc-400">Gerencie as proposituras legislativas.</p>
         </div>
         <Link href={`/admin/${slug}/projetos/new`}>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-blue-500/50">
                <Plus className="mr-2 h-4 w-4" /> Novo Projeto
            </Button>
         </Link>
      </div>

      {/* List */}
      {!projetos || projetos.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-zinc-800 text-zinc-500">
              Nenhum projeto encontrado.
          </div>
      ) : (
          <div className="space-y-4">
              {projetos.map((projeto) => (
                  <div key={projeto.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl hover:bg-zinc-900/80 transition-colors">
                      <div className="flex gap-4 items-start">
                          <div className="h-12 w-12 rounded-lg bg-zinc-800 flex flex-shrink-0 items-center justify-center text-blue-500">
                              <FileText className="h-6 w-6" />
                          </div>
                          <div>
                              <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-white text-lg">{projeto.numero || "S/N"}</h3>
                                  <Badge variant="outline" className="border-zinc-700 text-zinc-400 capitalize">
                                      {projeto.status.replace("_", " ")}
                                  </Badge>
                              </div>
                              <h4 className="text-zinc-200 font-medium mb-1">{projeto.titulo}</h4>
                              <p className="text-sm text-zinc-500 line-clamp-2 max-w-2xl">{projeto.ementa}</p>
                              
                              <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500">
                                  <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {projeto.autor}
                                  </div>
                                  {projeto.texto_url && (
                                    <div className="flex items-center gap-1">
                                        <ScrollText className="h-3 w-3" />
                                        <a href={projeto.texto_url} target="_blank" className="hover:text-blue-400 hover:underline">Texto Original</a>
                                    </div>
                                  )}
                              </div>
                          </div>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto">
                           <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 flex-1 md:flex-none">
                               Editar
                          </Button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {totalPages > 1 && (
          <Pagination totalPages={totalPages} currentPage={currentPage} />
      )}
    </div>
  )
}
