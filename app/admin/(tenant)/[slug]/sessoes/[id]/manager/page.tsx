import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import { SessaoManager } from "@/components/admin/sessoes/SessaoManager"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SessionManagerPage({ 
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

    if (!sessao) notFound()

    // 2. Get Councilors (to show voting progress)
    const { data: councilors } = await supabase
        .from("vereadores")
        .select("*")
        .eq("camara_id", sessao.camara_id)
        .eq("ativo", true)
        .order("nome")

    // 3. Get Pauta Items (projects to be voted)
    const { data: pautaItems } = await supabase
        .from("pauta_itens")
        .select(`
            id,
            ordem,
            projeto:projetos (
                id,
                numero,
                titulo,
                ementa,
                status
            )
        `)
        .eq("sessao_id", id)
        .order("ordem", { ascending: true })

    // 4. Get Current Active Voting (if any)
    const { data: activeVoting } = await supabase
        .from("votacoes")
        .select("*, projetos(*)")
        .eq("sessao_id", id)
        .eq("status", "aberta")
        .maybeSingle()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/${slug}/sessoes`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Gerenciar Sessão</h2>
                    <p className="text-muted-foreground">{sessao.titulo}</p>
                </div>
            </div>

            <SessaoManager 
                sessao={sessao}
                councilors={councilors || []}
                pautaItems={pautaItems || []}
                activeVoting={activeVoting}
                slug={slug}
            />
        </div>
    )
}
