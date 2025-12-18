import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft, Trash2, FileText } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { addProjectToPauta, removeProjectFromPauta } from "@/app/admin/_actions/pauta"

export default async function PautaPage({ 
    params 
}: { 
    params: Promise<{ slug: string, id: string }> 
}) {
  const { slug, id } = await params
  const supabase = await createClient()

  // 1. Get Session Details
  const { data: sessao } = await supabase
    .from("sessoes")
    .select("*")
    .eq("id", id)
    .single()

  if (!sessao) {
      return <div>Sessão não encontrada</div>
  }

  // 2. Get Pauta Items (with Project details)
  const { data: pautaItens } = await supabase
    .from("pauta_itens")
    .select(`
        id,
        ordem,
        projeto:projetos (
            id,
            numero,
            titulo,
            ementa
        )
    `)
    .eq("sessao_id", id)
    .order("ordem", { ascending: true })

  // 3. Get Available Projects (Not in Pauta)
  // This is tricky in Supabase without a "not in" easy join sometimes, but let's try a simple approach
  // Fetch all projects for the camara, exclude ones in pautaIds.
  const pautaProjectIds = pautaItens?.map((item: any) => item.projeto?.id) || []
  
  let projectsQuery = supabase
      .from("projetos")
      .select("*")
      .eq("camara_id", sessao.camara_id)
      .neq("status", "votado") // Only projects not yet voted? Or any?
      .order("created_at", { ascending: false })
      
  if (pautaProjectIds.length > 0) {
      projectsQuery = projectsQuery.not("id", "in", `(${pautaProjectIds.join(",")})`)
  }
  
  const { data: availableProjects } = await projectsQuery.limit(20) // Limit for now

  return (
    <div className="space-y-6">
         <div className="flex items-center gap-4">
            <Link href={`/admin/${slug}/sessoes`}>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Pauta da Sessão</h2>
                <p className="text-zinc-400">{sessao.titulo}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Current Pauta */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Itens da Pauta</h3>
                <div className="space-y-2">
                    {pautaItens?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-400 font-mono">
                                    {item.ordem}
                                </span>
                                <div>
                                    <h4 className="font-medium text-white text-sm">{item.projeto.numero} - {item.projeto.titulo}</h4>
                                </div>
                            </div>
                            <form action={async () => {
                                "use server"
                                await removeProjectFromPauta(slug, item.id)
                            }}>
                                <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-950/20">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    ))}
                    {(!pautaItens || pautaItens.length === 0) && (
                        <p className="text-zinc-500 text-sm italic">Nenhum item na pauta.</p>
                    )}
                </div>
            </div>

            {/* Right: Available Projects */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Projetos Disponíveis</h3>
                <div className="space-y-2">
                     {availableProjects?.map((projeto) => (
                        <div key={projeto.id} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg hover:border-blue-500/30">
                            <div>
                                <h4 className="font-medium text-white text-sm">{projeto.numero || "S/N"}</h4>
                                <p className="text-xs text-zinc-500 line-clamp-1">{projeto.titulo}</p>
                            </div>
                            <form action={async () => {
                                "use server"
                                await addProjectToPauta(slug, id, projeto.id)
                            }}>
                                <Button size="sm" variant="secondary" className="bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 hover:text-blue-400 border border-blue-500/20">
                                    <Plus className="h-4 w-4 mr-1" /> Adicionar
                                </Button>
                            </form>
                        </div>
                    ))}
                     {(!availableProjects || availableProjects.length === 0) && (
                        <p className="text-zinc-500 text-sm italic">Nenhum projeto disponível.</p>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}
