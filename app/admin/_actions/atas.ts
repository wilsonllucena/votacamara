"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getAtas(slug: string, tipo: 'sessao' | 'comissao', page = 1, search = "", limit = 10) {
  const supabase = await createClient()
  
  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) return { data: [], count: 0 }

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from("atas")
    .select("*", { count: "exact" })
    .eq("camara_id", camara.id)
    .eq("tipo", tipo)
    .order("data", { ascending: false })

  if (search) {
    query = query.ilike("nome", `%${search}%`)
  }

  const { data, count } = await query.range(from, to)

  return { data, count }
}

export async function deleteAta(slug: string, id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("atas")
    .delete()
    .eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/admin/${slug}/sessoes/atas`)
  revalidatePath(`/admin/${slug}/comissoes/atas`)
  return { success: true }
}
