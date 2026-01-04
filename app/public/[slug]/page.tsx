import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { PublicVotingClient } from "@/components/public/PublicVotingClient"

interface PublicVotingPageProps {
    params: Promise<{ slug: string }>
}

export default async function PublicVotingPage({ params }: PublicVotingPageProps) {
    const { slug } = await params
    const supabase = await createClient()

    // 1. Get Camara info
    const { data: camara } = await supabase
        .from("camaras")
        .select("id, nome, slug")
        .eq("slug", slug)
        .single()

    if (!camara) notFound()

    // 2. Get current active session
    const { data: activeSession } = await supabase
        .from("sessoes")
        .select("*")
        .eq("camara_id", camara.id)
        .eq("status", "aberta")
        .maybeSingle()

    // 3. Get active voting if any
    const { data: activeVoting } = await supabase
        .from("votacoes")
        .select("*, projetos(*)")
        .eq("camara_id", camara.id)
        .eq("status", "aberta")
        .maybeSingle()

    // 4. Get all councilors for this chamber (excluding executive)
    const { data: councilors } = await supabase
        .from("vereadores")
        .select("id, nome, partido, foto_url, user_id")
        .eq("camara_id", camara.id)
        .eq("ativo", true)
        .eq("is_executivo", false)
        .order("nome")

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <PublicVotingClient 
                camara={camara}
                activeSession={activeSession}
                activeVoting={activeVoting}
                councilors={councilors || []}
                slug={slug}
            />
        </div>
    )
}