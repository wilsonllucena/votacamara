import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import { VotingClient } from "@/components/admin/votar/VotingClient"

export default async function VotarPage({ 
    params 
}: { 
    params: Promise<{ slug: string }> 
}) {
    const { slug } = await params
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // 2. Get Vereador profile linked to this user
    const { data: vereador } = await supabase
        .from("vereadores")
        .select("*")
        .eq("user_id", user.id)
        .single()

    if (!vereador) {
        // If not a vereador, but maybe an admin? 
        // Let's check profile role if not found in vereadores
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("user_id", user.id)
            .single()
        
        if (profile?.role !== 'ADMIN' && profile?.role !== 'PRESIDENTE') {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                    <h2 className="text-xl font-bold">Acesso Restrito</h2>
                    <p className="text-muted-foreground">Esta página é exclusiva para vereadores cadastrados no sistema.</p>
                </div>
            )
        }
        // If admin/president, we might want to show them the view as well? 
        // For now, let's just handle it or show a message.
        // Actually, the user asked for a page where VEREADORES can vote.
    }

    // 3. Get Camara ID for fallback
    const { data: camara } = await supabase
        .from("camaras")
        .select("id")
        .eq("slug", slug)
        .single()

    if (!camara) notFound()

    // 4. Get Current Active Voting for this chamber
    const { data: activeVoting } = await supabase
        .from("votacoes")
        .select("*, projetos(*)")
        .eq("camara_id", camara.id)
        .eq("status", "aberta")
        .maybeSingle()

    // 5. Get current session status if any active voting exists or just get the latest session
    let sessaoStatus = "agendada"
    if (activeVoting) {
        const { data: sessao } = await supabase
            .from("sessoes")
            .select("status")
            .eq("id", activeVoting.sessao_id)
            .single()
        if (sessao) sessaoStatus = sessao.status
    } else {
        // Get latest session to show correct status
        const { data: latestSessao } = await supabase
            .from("sessoes")
            .select("status")
            .eq("camara_id", camara.id)
            .order("data", { ascending: false })
            .limit(1)
            .maybeSingle()
        if (latestSessao) sessaoStatus = latestSessao.status
    }

    return (
        <div className="py-6 min-h-full">
            <VotingClient 
                vereador={vereador} 
                slug={slug} 
                initialActiveVoting={activeVoting} 
                camaraId={camara.id}
                initialSessaoStatus={sessaoStatus}
            />
        </div>
    )
}
