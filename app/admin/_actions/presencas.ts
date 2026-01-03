'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPresencas(sessaoId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("sessao_presencas")
        .select(`
            *,
            vereadores:vereador_id!inner (id, nome, partido, foto_url, is_executivo)
        `)
        .eq("sessao_id", sessaoId)
        .eq("vereadores.is_executivo", false)

    if (error) return { error: error.message }
    return { data }
}

export async function upsertPresenca(slug: string, data: {
    sessao_id: string
    vereador_id: string
    status: 'presente' | 'ausente' | 'justificado'
    justificativa?: string
    camara_id: string
}) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("sessao_presencas")
        .upsert({
            ...data,
            updated_at: new Date().toISOString()
        })

    if (error) return { error: error.message }
    
    revalidatePath(`/admin/${slug}/sessoes/presencas`)
    return { success: true }
}

export async function upsertPresencasBatch(slug: string, presencas: any[]) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("sessao_presencas")
        .upsert(presencas.map(p => ({
            ...p,
            updated_at: new Date().toISOString()
        })))

    if (error) return { error: error.message }

    revalidatePath(`/admin/${slug}/sessoes/presencas`)
    return { success: true }
}

export async function initializePresencas(slug: string, sessaoId: string, camaraId: string) {
    const supabase = await createClient()

    // 1. Get all active councilors for the chamber
    const { data: vereadores, error: vError } = await supabase
        .from("vereadores")
        .select("id")
        .eq("camara_id", camaraId)
        .eq("ativo", true)
        .eq("is_executivo", false)

    if (vError) return { error: vError.message }

    // 2. Check if presences already exist
    const { data: existing, error: eError } = await supabase
        .from("sessao_presencas")
        .select("id")
        .eq("sessao_id", sessaoId)

    if (eError) return { error: eError.message }
    if (existing && existing.length > 0) return { success: true }

    // 3. Create initial presences as 'ausente'
    const initialPresencas = vereadores.map(v => ({
        camara_id: camaraId,
        sessao_id: sessaoId,
        vereador_id: v.id,
        status: 'ausente'
    }))

    const { error } = await supabase
        .from("sessao_presencas")
        .insert(initialPresencas)

    if (error) return { error: error.message }

    revalidatePath(`/admin/${slug}/sessoes/presencas`)
    return { success: true }
}

export async function getSessionsWithStats(camaraId: string, searchParams: { 
    search?: string
    year?: string
    type?: string
    page?: number
    itemsPerPage?: number
}) {
    const supabase = await createClient()
    const { search, year, type, page = 1, itemsPerPage = 10 } = searchParams

    let query = supabase
        .from("sessoes")
        .select(`
            *,
            presencas:sessao_presencas (status)
        `, { count: "exact" })
        .eq("camara_id", camaraId)
        .in("status", ["aberta", "encerrada"])
        .order("status", { ascending: true })
        .order("iniciou_em", { ascending: false })

    if (search) {
        query = query.ilike("titulo", `%${search}%`)
    }

    if (year) {
        query = query.gte("iniciou_em", `${year}-01-01`).lte("iniciou_em", `${year}-12-31`)
    }

    if (type) {
        query = query.eq("tipo", type)
    }

    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    const { data, count, error } = await query.range(from, to)

    if (error) return { error: error.message }

    const formattedData = data.map(session => {
        const presencas = session.presencas || []
        const stats = {
            presente: presencas.filter((p: any) => p.status === 'presente').length,
            ausente: presencas.filter((p: any) => p.status === 'ausente').length,
            justificado: presencas.filter((p: any) => p.status === 'justificado').length,
            total: presencas.length
        }
        return { ...session, stats }
    })

    return { 
        data: formattedData, 
        count,
        totalPages: count ? Math.ceil(count / itemsPerPage) : 0
    }
}

export async function getGlobalPresencaStats(camaraId: string, filter?: { year?: string, type?: string }) {
    const supabase = await createClient()

    // 1. First, get the session IDs that match the filters
    let sessionQuery = supabase
        .from("sessoes")
        .select("id")
        .eq("camara_id", camaraId)
        .in("status", ["aberta", "encerrada"])

    if (filter?.year) {
        sessionQuery = sessionQuery.gte("iniciou_em", `${filter.year}-01-01`).lte("iniciou_em", `${filter.year}-12-31`)
    }

    if (filter?.type) {
        sessionQuery = sessionQuery.eq("tipo", filter.type)
    }

    const { data: sessions } = await sessionQuery
    const sessionIds = sessions?.map(s => s.id) || []

    if (sessionIds.length === 0) {
        return {
            overview: { presente: 0, ausente: 0, justificado: 0 },
            byCouncilor: []
        }
    }

    // 2. Get presences ONLY for those sessions (and for those who are NOT executivo)
    const { data, error } = await supabase
        .from("sessao_presencas")
        .select(`
            status, 
            vereador_id, 
            vereadores:vereador_id!inner(nome, is_executivo)
        `)
        .in("sessao_id", sessionIds)
        .eq("vereadores.is_executivo", false)

    if (error) return { error: error.message }

    const overview = {
        presente: data.filter(p => p.status === 'presente').length,
        ausente: data.filter(p => p.status === 'ausente').length,
        justificado: data.filter(p => p.status === 'justificado').length,
    }

    // Group by councilor
    const byCouncilor: Record<string, { nome: string, presente: number, ausente: number, justificado: number, total: number }> = {}

    data.forEach(p => {
        const vid = p.vereador_id
        if (!byCouncilor[vid]) {
            byCouncilor[vid] = { 
                nome: (p.vereadores as any)?.nome || "Desconhecido", 
                presente: 0, 
                ausente: 0, 
                justificado: 0, 
                total: 0 
            }
        }
        byCouncilor[vid][p.status as 'presente' | 'ausente' | 'justificado']++
        byCouncilor[vid].total++
    })

    return {
        overview,
        byCouncilor: Object.values(byCouncilor).sort((a, b) => b.presente / b.total - a.presente / a.total)
    }
}
