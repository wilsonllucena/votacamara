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
    }

    if (vereador?.is_executivo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-2">
                    <span className="text-amber-500 text-2xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-bold">Acesso não permitido</h2>
                <p className="text-muted-foreground max-w-md">Membros do Poder Executivo (Prefeitos e Vice-Prefeitos) não possuem poder de voto no legislativo e não podem acessar a interface de votação.</p>
            </div>
        )
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

    // 5. Get current session status and ID
    let sessaoStatus = "agendada"
    let sessaoId = "global"

    // Get latest session for this chamber
    const { data: latestSessao } = await supabase
        .from("sessoes")
        .select("id, status")
        .eq("camara_id", camara.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

    if (latestSessao) {
        sessaoId = latestSessao.id
        sessaoStatus = latestSessao.status
    }

    // 6. Define Abilities
    const { defineAbilityFor } = await import("@/lib/casl/ability")
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single()
    const ability = defineAbilityFor(profile?.role || 'PUBLICO')
    const rules = ability.rules

    return (
        <div className="py-6 min-h-full">
            <VotingClient 
                vereador={vereador} 
                slug={slug} 
                initialActiveVoting={activeVoting} 
                camaraId={camara.id}
                initialSessaoStatus={sessaoStatus}
                sessaoId={sessaoId}
                rules={rules as any}
            />
        </div>
    )
}
