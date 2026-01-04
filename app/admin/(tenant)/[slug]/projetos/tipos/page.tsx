import { Suspense } from "react"
import { getTiposMateria } from "@/app/admin/_actions/projetos"
import { TiposMateriaClient } from "@/components/admin/projetos/TiposMateriaClient"

import { createClient } from "@/utils/supabase/server"

export default async function TiposMateriaPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const tipos = await getTiposMateria()
    const supabase = await createClient()

    // Fetch Role and Define Abilities
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user?.id)
        .single()

    const { defineAbilityFor } = await import("@/lib/casl/ability")
    const ability = defineAbilityFor(profile?.role || 'PUBLICO')
    const rules = ability.rules

    return (
        <div className="py-6">
            <Suspense fallback={<div className="text-white">Carregando tipos...</div>}>
                <TiposMateriaClient tipos={(tipos as any) || []} rules={rules as any} />
            </Suspense>
        </div>
    )
}
