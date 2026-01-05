import { MateriaDetailClient } from "@/components/admin/projetos/MateriaDetailClient"
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"

export default async function MateriaDetailPage({ 
    params 
}: { 
    params: Promise<{ slug: string, id: string }> 
}) {
    const { slug, id } = await params
    const supabase = await createClient()

    // 1. Get Matter Details
    const { data: projeto } = await supabase
        .from("projetos")
        .select(`
            *,
            projeto_categorias (id, nome),
            situacao,
            projeto_autores (
                vereadores (id, nome, partido)
            ),
            tipos_materia (id, nome, sigla)
        `)
        .eq("id", id)
        .single()

    if (!projeto) notFound()

    // 2. Fetch Role and Define Abilities
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user?.id)
        .single()

    let vereadorId = null
    if (profile?.role === 'VEREADOR') {
        const { data: v } = await supabase
            .from("vereadores")
            .select("id")
            .eq("user_id", user?.id)
            .single()
        vereadorId = v?.id || null
    }

    const { defineAbilityFor } = await import("@/lib/casl/ability")
    const ability = defineAbilityFor(profile?.role || 'PUBLICO', vereadorId)
    const rules = ability.rules

    return (
        <MateriaDetailClient 
            projeto={projeto as any} 
            slug={slug} 
            rules={rules as any} 
        />
    )
}
