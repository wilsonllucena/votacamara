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

    // 1. Encerrar a sessão no banco
    const { data: sessao, error: sError } = await supabase
        .from("sessoes")
        .update({ 
            status: "encerrada",
            encerrou_em: new Date().toISOString()
        })
        .eq("id", sessaoId)
        .select("camara_id")
        .single()

    if (sError) return { error: sError.message }

    // 2. Automação de Presença
    try {
        const camaraId = sessao.camara_id

        // Buscar todos os vereadores ativos (que não são do executivo)
        const { data: vereadores } = await supabase
            .from("vereadores")
            .select("id")
            .eq("camara_id", camaraId)
            .eq("ativo", true)
            .eq("is_executivo", false)

        // Buscar votações desta sessão
        const { data: votacoes } = await supabase
            .from("votacoes")
            .select("id")
            .eq("sessao_id", sessaoId)

        const votacaoIds = votacoes?.map(v => v.id) || []

        // Buscar vereadores que votaram
        let votantes: string[] = []
        if (votacaoIds.length > 0) {
            const { data: votos } = await supabase
                .from("votos")
                .select("vereador_id")
                .in("votacao_id", votacaoIds)
            
            votantes = Array.from(new Set(votos?.map(v => v.vereador_id) || []))
        }

        // Buscar presenças existentes (para respeitar justificativas já registradas)
        const { data: presencasExistem } = await supabase
            .from("sessao_presencas")
            .select("vereador_id, status")
            .eq("sessao_id", sessaoId)

        // Preparar registros
        const presencaBatch = vereadores?.map(v => {
            const jaExiste = presencasExistem?.find(p => p.vereador_id === v.id)
            
            const votou = votantes.includes(v.id)
            let status: 'presente' | 'ausente' | 'justificado' = votou ? 'presente' : 'ausente'
            
            // Se não votou mas já estava justificado, mantém a justificativa
            if (!votou && jaExiste?.status === 'justificado') {
                status = 'justificado'
            }

            return {
                camara_id: camaraId,
                sessao_id: sessaoId,
                vereador_id: v.id,
                status,
                updated_at: new Date().toISOString()
            }
        }) || []

        if (presencaBatch.length > 0) {
            await supabase
                .from("sessao_presencas")
                .upsert(presencaBatch, { onConflict: 'sessao_id,vereador_id' })
        }
    } catch (err) {
        console.error("Erro na automação de presença:", err)
    }

    revalidatePath(`/admin/${slug}/sessoes/${sessaoId}/manager`)
    revalidatePath(`/admin/${slug}/sessoes/presencas`)
    return { success: true }
}

/**
 * Abre a votação para um projeto específico dentro de uma sessão.
 */
export async function openVoting(slug: string, sessaoId: string, projetoId: string, timerSeconds?: number) {
    const supabase = await createClient()

    // 1. Verificar se já existe uma votação aberta nesta sessão
    const { data: openVotingData } = await supabase
        .from("votacoes")
        .select("id")
        .eq("sessao_id", sessaoId)
        .eq("status", "aberta")
        .single()

    if (openVotingData) {
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

    // 3. Calcular data de expiração se houver timer
    let expira_em = null
    if (timerSeconds && timerSeconds > 0) {
        const now = new Date()
        expira_em = new Date(now.getTime() + timerSeconds * 1000).toISOString()
    }

    // 4. Criar a votação
    const { error } = await supabase
        .from("votacoes")
        .insert({
            camara_id: profile.camara_id,
            sessao_id: sessaoId,
            projeto_id: projetoId,
            status: "aberta",
            abriu_em: new Date().toISOString(),
            expira_em
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
            .update({ 
                status: "votado",
                situacao: "VOTADA" 
            })
            .eq("id", votacao.projeto_id)
    }

    revalidatePath(`/admin/${slug}/sessoes/${sessaoId}/manager`)
    return { success: true }
}

/**
 * Interrompe a votação (cancela sem marcar como votado).
 */
export async function interruptVoting(slug: string, sessaoId: string, votacaoId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("votacoes")
        .update({ 
            status: "encerrada",
            encerrou_em: new Date().toISOString()
        })
        .eq("id", votacaoId)

    if (error) return { error: error.message }

    revalidatePath(`/admin/${slug}/sessoes/${sessaoId}/manager`)
    return { success: true }
}

/**
 * Registra o voto de um vereador.
 */
export async function registrarVoto(votacaoId: string, valor: 'SIM' | 'NAO' | 'FAVORAVEL' | 'CONTRA' | 'ABSTENCAO' | 'AUSENTE') {
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
