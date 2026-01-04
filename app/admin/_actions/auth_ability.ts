import { createClient } from "@/utils/supabase/server"
import { defineAbilityFor, Action, Subject } from "@/lib/casl/ability"

/**
 * Helper para verificar permissões no lado do servidor (Server Actions)
 */
export async function checkAbility(action: Action, subject: Subject) {
    const supabase = await createClient()
    
    // 1. Obter usuário logado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // 2. Obter perfil para saber o role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single()

    if (!profile) return false

    // 3. Definir abilidades e checar
    const ability = defineAbilityFor(profile.role)
    return ability.can(action, subject)
}
