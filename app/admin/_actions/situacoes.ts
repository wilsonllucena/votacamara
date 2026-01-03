'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const situacaoSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  label: z.string().min(2, "O label deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional().or(z.literal("")),
})

export async function createSituacao(slug: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) return { error: "Câmara não encontrada" }

  const validatedFields = situacaoSchema.safeParse({
    nome: formData.get("nome"),
    label: formData.get("label"),
    descricao: formData.get("descricao"),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const { nome, label, descricao } = validatedFields.data

  const { error } = await supabase.from("projeto_situacoes").insert({
    camara_id: camara.id,
    nome,
    label: label.toUpperCase().replace(/\s+/g, '_'),
    descricao: descricao || null
  })

  if (error) {
    return { error: "Erro ao criar situação: " + error.message }
  }

  revalidatePath(`/admin/${slug}/projetos/situacoes`)
  return { success: true }
}

export async function updateSituacao(slug: string, id: string, data: z.infer<typeof situacaoSchema>) {
  const supabase = await createClient()

  const validatedFields = situacaoSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: "Dados inválidos" }
  }

  const { nome, label, descricao } = validatedFields.data

  const { error } = await supabase
    .from("projeto_situacoes")
    .update({
      nome,
      label: label.toUpperCase().replace(/\s+/g, '_'),
      descricao: descricao || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)

  if (error) {
    return { error: "Erro ao atualizar situação: " + error.message }
  }

  revalidatePath(`/admin/${slug}/projetos/situacoes`)
  return { success: true }
}

export async function deleteSituacao(slug: string, id: string) {
  const supabase = await createClient()

  // Verificar se existem matérias vinculadas
  const { data: projetos } = await supabase
    .from("projetos")
    .select("id")
    .eq("situacao_id", id)
    .limit(1)

  if (projetos && projetos.length > 0) {
    return { error: "Não é possível excluir uma situação que possui matérias vinculadas." }
  }

  const { error } = await supabase
    .from("projeto_situacoes")
    .delete()
    .eq("id", id)

  if (error) {
    return { error: "Erro ao excluir situação: " + error.message }
  }

  revalidatePath(`/admin/${slug}/projetos/situacoes`)
  return { success: true }
}

export async function getSituacoes(slug: string) {
    const supabase = await createClient()
    
    const { data: camara } = await supabase
      .from("camaras")
      .select("id")
      .eq("slug", slug)
      .single()
  
    if (!camara) return []
  
    const { data } = await supabase
      .from("projeto_situacoes")
      .select("*")
      .eq("camara_id", camara.id)
      .order("nome")
  
    return data || []
  }
