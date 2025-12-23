'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const projetoSchema = z.object({
  numero: z.string().min(1, "Número é obrigatório"),
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  ementa: z.string().min(10, "Ementa deve ser detalhada"),
  autor: z.string().min(2, "Autor é obrigatório"),
  autor_id: z.string().uuid("Vereador selecionado inválido").optional().or(z.literal("")),
  texto_url: z.string().url("URL do texto deve ser válida").optional().or(z.literal("")),
  status: z.enum(["Rascunho", "Em Pauta", "Votado"]),
})

export async function createProjeto(slug: string, prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) {
      return { message: "Câmara não encontrada" }
  }

  const validatedFields = projetoSchema.safeParse({
    numero: formData.get("numero"),
    titulo: formData.get("titulo"),
    ementa: formData.get("ementa"),
    autor: formData.get("autor"),
    autor_id: formData.get("autor_id"),
    texto_url: formData.get("texto_url"),
    status: formData.get("status"),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const { numero, titulo, ementa, autor, autor_id, texto_url, status } = validatedFields.data

  const { error } = await supabase.from("projetos").insert({
    camara_id: camara.id,
    numero,
    titulo,
    ementa,
    autor,
    autor_id: autor_id || null,
    texto_url: texto_url || null,
    status: status === "Em Pauta" ? "em_pauta" : status.toLowerCase()
  })

  if (error) {
    return { error: "Erro ao criar projeto: " + error.message }
  }

  revalidatePath(`/admin/${slug}/projetos`)
  return { success: true }
}

export async function updateProjeto(slug: string, id: string, data: z.infer<typeof projetoSchema>) {
    const supabase = await createClient()

    const validatedFields = projetoSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: validatedFields.error.message }
    }

    const { numero, titulo, ementa, autor, autor_id, texto_url, status } = validatedFields.data

    const { error } = await supabase
        .from("projetos")
        .update({
            numero,
            titulo,
            ementa,
            autor,
            autor_id: autor_id || null,
            texto_url: texto_url || null,
            status: status === "Em Pauta" ? "em_pauta" : status.toLowerCase()
        })
        .eq("id", id)

    if (error) {
        return { error: "Erro ao atualizar projeto: " + error.message }
    }

    revalidatePath(`/admin/${slug}/projetos`)
    return { success: true }
}

export async function deleteProjeto(slug: string, id: string) {
    const supabase = await createClient()

    // Check if linked to pauta_itens (sessions)
    const { data: pautaItems, error: pautaError } = await supabase
        .from("pauta_itens")
        .select("id")
        .eq("projeto_id", id)
        .limit(1)

    if (pautaError) {
        return { error: "Erro ao verificar vínculos: " + pautaError.message }
    }

    if (pautaItems && pautaItems.length > 0) {
        return { error: "Não é possível excluir um projeto que está vinculado a uma sessão (pauta)." }
    }

    const { error } = await supabase
        .from("projetos")
        .delete()
        .eq("id", id)

    if (error) {
        return { error: "Erro ao excluir projeto: " + error.message }
    }

    revalidatePath(`/admin/${slug}/projetos`)
    return { success: true }
}
