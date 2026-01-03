import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import { PresencasClient } from "@/components/admin/sessoes/PresencasClient"
import { getSessionsWithStats, getGlobalPresencaStats } from "@/app/admin/_actions/presencas"

interface PresencasPageProps {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ 
        search?: string
        year?: string
        type?: string
        page?: string
    }>
}

export default async function PresencasPage({ params, searchParams }: PresencasPageProps) {
    const { slug } = await params
    const sParams = await searchParams
    const supabase = await createClient()

    // 1. Get Camara info
    const { data: camara } = await supabase
        .from("camaras")
        .select("id")
        .eq("slug", slug)
        .single()

    if (!camara) notFound()

    // 2. Fetch Sessions with stats
    const currentYear = new Date().getFullYear().toString()
    const selectedYear = sParams.year || "2025" // Fallback to 2025 for now since the data is there
    
    const sessionsResult = await getSessionsWithStats(camara.id, {
        search: sParams.search,
        year: selectedYear,
        type: sParams.type,
        page: sParams.page ? parseInt(sParams.page) : 1
    })

    if (sessionsResult.error) {
        console.error(sessionsResult.error)
    }

    // 3. Fetch Global Stats with same filters
    const globalStatsResult = await getGlobalPresencaStats(camara.id, {
        year: selectedYear,
        type: sParams.type
    })

    if (globalStatsResult.error) {
        console.error(globalStatsResult.error)
    }

    return (
        <div className="py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-foreground tracking-tight">Lista de Presença</h1>
                <p className="text-muted-foreground font-medium">Acompanhe e gerencie a frequência dos parlamentares nas sessões.</p>
            </div>

            <PresencasClient 
                slug={slug}
                camaraId={camara.id}
                initialSessions={sessionsResult.data || []}
                count={sessionsResult.count || 0}
                totalPages={sessionsResult.totalPages || 0}
                globalStats={globalStatsResult as any}
            />
        </div>
    )
}
