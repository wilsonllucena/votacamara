'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCargo(slug: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const nome = formData.get("nome") as string
  const descricao = formData.get("descricao") as string

  if (!nome || nome.length < 2) {
    return { error: "O nome do cargo deve ter pelo menos 2 caracteres" }
  }

  // 1. Get Camara
  const { data: camara, error: camaraError } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (camaraError || !camara) {
    return { error: "Câmara não encontrada" }
  }

  // 2. Create Cargo
  const { error: cargoError } = await supabase
    .from("cargos")
    .insert({
      camara_id: camara.id,
      nome,
      descricao: descricao || null
    })

  if (cargoError) {
    return { error: "Erro ao criar cargo: " + cargoError.message }
  }

  revalidatePath(`/admin/${slug}/cargos`)
  return { success: true }
}

export async function updateCargo(slug: string, id: string, data: { nome: string, descricao?: string }) {
  const supabase = await createClient()

  if (!data.nome || data.nome.length < 2) {
    return { error: "O nome do cargo deve ter pelo menos 2 caracteres" }
  }

  const { error } = await supabase
    .from("cargos")
    .update({
      nome: data.nome,
      descricao: data.descricao || null
    })
    .eq("id", id)

  if (error) {
    return { error: "Erro ao atualizar cargo: " + error.message }
  }

  revalidatePath(`/admin/${slug}/cargos`)
  return { success: true }
}

export async function deleteCargo(slug: string, id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("cargos")
    .delete()
    .eq("id", id)

  if (error) {
    return { error: "Erro ao excluir cargo: " + error.message }
  }

  revalidatePath(`/admin/${slug}/cargos`)
  return { success: true }
}
