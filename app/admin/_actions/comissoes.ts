"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const comissaoSchema = z.object({
  nome: z.string().min(3, "Mínimo 3 caracteres"),
  tipo: z.string().min(2, "Tipo é obrigatório"),
  descricao: z.string().optional().or(z.literal("")),
})

export async function getComissoes(slug: string, page = 1, search = "", limit = 10) {
  const supabase = await createClient()
  
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) return { data: [], count: 0 }

  let query = supabase
    .from("comissoes")
    .select("*, comissao_membros(*, vereadores(*))", { count: "exact" })
    .eq("camara_id", camara.id)
    .order("nome", { ascending: true })

  if (search) {
    query = query.ilike("nome", `%${search}%`)
  }

  const { data, count } = await query.range(from, to)

  return { data, count }
}

export async function createComissao(slug: string, data: z.infer<typeof comissaoSchema>) {
  const supabase = await createClient()
  
  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) return { success: false, error: "Câmara não encontrada" }

  const { data: newComissao, error } = await supabase
    .from("comissoes")
    .insert({
      ...data,
      camara_id: camara.id
    })
    .select("id")
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/admin/${slug}/comissoes`)
  return { success: true, id: newComissao.id }
}

export async function updateComissao(slug: string, id: string, data: z.infer<typeof comissaoSchema>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("comissoes")
    .update(data)
    .eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/admin/${slug}/comissoes`)
  return { success: true }
}

export async function deleteComissao(slug: string, id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("comissoes")
    .delete()
    .eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/admin/${slug}/comissoes`)
  return { success: true }
}

export async function updateMembros(slug: string, comissaoId: string, membros: { vereador_id: string, cargo: string }[]) {
  const supabase = await createClient()

  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) return { success: false, error: "Câmara não encontrada" }

  // Deletar membros antigos
  await supabase
    .from("comissao_membros")
    .delete()
    .eq("comissao_id", comissaoId)

  // Inserir novos membros
  if (membros.length > 0) {
    const { error } = await supabase
      .from("comissao_membros")
      .insert(membros.map(m => ({
        ...m,
        comissao_id: comissaoId,
        camara_id: camara.id
      })))

    if (error) return { success: false, error: error.message }
  }

  revalidatePath(`/admin/${slug}/comissoes`)
  return { success: true }
}
