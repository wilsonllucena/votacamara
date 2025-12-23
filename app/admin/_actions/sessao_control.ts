'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

/**
 * Inicia uma sessão oficial.
 */
export async function startSession(slug: string, sessaoId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("sessoes")
        .update({ 
            status: "aberta",
            iniciou_em: new Date().toISOString()
        })
        .eq("id", sessaoId)

    if (error) return { error: error.message }

    revalidatePath(`/admin/${slug}/sessoes/${sessaoId}/manager`)
    return { success: true }
}

/**
 * Encerra uma sessão oficial.
 */
export async function endSession(slug: string, sessaoId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("sessoes")
        .update({ 
            status: "encerrada",
            encerrou_em: new Date().toISOString()
        })
        .eq("id", sessaoId)

    if (error) return { error: error.message }

    revalidatePath(`/admin/${slug}/sessoes/${sessaoId}/manager`)
    return { success: true }
}

/**
 * Abre a votação para um projeto específico dentro de uma sessão.
 */
export async function openVoting(slug: string, sessaoId: string, projetoId: string) {
    const supabase = await createClient()

    // 1. Verificar se já existe uma votação aberta nesta sessão
    const { data: openVoting } = await supabase
        .from("votacoes")
        .select("id")
        .eq("sessao_id", sessaoId)
        .eq("status", "aberta")
        .single()

    if (openVoting) {
        return { error: "Já existe uma votação aberta para esta sessão." }
    }

    // 2. Buscar camara_id do perfil do usuário
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from("profiles")
        .select("camara_id")
        .eq("user_id", user?.id)
        .single()

    if (!profile) return { error: "Perfil não encontrado." }

    // 3. Criar a votação
    const { error } = await supabase
        .from("votacoes")
        .insert({
            camara_id: profile.camara_id,
            sessao_id: sessaoId,
            projeto_id: projetoId,
            status: "aberta",
            abriu_em: new Date().toISOString()
        })

    if (error) return { error: error.message }

    revalidatePath(`/admin/${slug}/sessoes/${sessaoId}/manager`)
    return { success: true }
}

/**
 * Encerra a votação de um projeto.
 */
export async function closeVoting(slug: string, sessaoId: string, votacaoId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("votacoes")
        .update({ 
            status: "encerrada",
            encerrou_em: new Date().toISOString()
        })
        .eq("id", votacaoId)

    if (error) return { error: error.message }

    // Opcional: Atualizar status do projeto para 'votado'
    const { data: votacao } = await supabase
        .from("votacoes")
        .select("projeto_id")
        .eq("id", votacaoId)
        .single()
    
    if (votacao) {
        await supabase
            .from("projetos")
            .update({ status: "votado" })
            .eq("id", votacao.projeto_id)
    }

    revalidatePath(`/admin/${slug}/sessoes/${sessaoId}/manager`)
    return { success: true }
}

/**
 * Registra o voto de um vereador.
 */
export async function registrarVoto(votacaoId: string, valor: 'SIM' | 'NAO' | 'ABSTENCAO' | 'AUSENTE') {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    // Buscar o vereador_id associado ao usuário
    const { data: vereador } = await supabase
        .from("vereadores")
        .select("id, camara_id")
        .eq("user_id", user?.id)
        .single()

    if (!vereador) return { error: "Vereador não encontrado." }

    const { error } = await supabase
        .from("votos")
        .upsert({
            camara_id: vereador.camara_id,
            votacao_id: votacaoId,
            vereador_id: vereador.id,
            valor,
            registrado_em: new Date().toISOString()
        })

    if (error) return { error: error.message }

    return { success: true }
}
