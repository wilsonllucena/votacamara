'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const categoriaSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional().or(z.literal("")),
})

export async function createCategoria(slug: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  // Buscar ID da câmara pelo slug
  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) return { error: "Câmara não encontrada" }

  const validatedFields = categoriaSchema.safeParse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao"),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const { nome, descricao } = validatedFields.data

  const { error } = await supabase.from("projeto_categorias").insert({
    camara_id: camara.id,
    nome: nome.toUpperCase(),
    descricao: descricao || null
  })

  if (error) {
    return { error: "Erro ao criar categoria: " + error.message }
  }

  revalidatePath(`/admin/${slug}/projetos/categorias`)
  return { success: true }
}

export async function updateCategoria(slug: string, id: string, data: z.infer<typeof categoriaSchema>) {
  const supabase = await createClient()

  const validatedFields = categoriaSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: "Dados inválidos" }
  }

  const { nome, descricao } = validatedFields.data

  const { error } = await supabase
    .from("projeto_categorias")
    .update({
      nome: nome.toUpperCase(),
      descricao: descricao || null,
      updated_at: new Promise(resolve => resolve(new Date().toISOString())) as any // Forçar update timestamp se necessário
    })
    .eq("id", id)

  if (error) {
    return { error: "Erro ao atualizar categoria: " + error.message }
  }

  revalidatePath(`/admin/${slug}/projetos/categorias`)
  return { success: true }
}

export async function deleteCategoria(slug: string, id: string) {
  const supabase = await createClient()

  // Verificar se existem matérias vinculadas
  const { data: projetos } = await supabase
    .from("projetos")
    .select("id")
    .eq("categoria_id", id)
    .limit(1)

  if (projetos && projetos.length > 0) {
    return { error: "Não é possível excluir uma categoria que possui matérias vinculadas." }
  }

  const { error } = await supabase
    .from("projeto_categorias")
    .delete()
    .eq("id", id)

  if (error) {
    return { error: "Erro ao excluir categoria: " + error.message }
  }

  revalidatePath(`/admin/${slug}/projetos/categorias`)
  return { success: true }
}
