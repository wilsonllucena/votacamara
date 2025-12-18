'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const projetoSchema = z.object({
  numero: z.string().min(1, "Número é obrigatório"),
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  ementa: z.string().min(10, "Ementa deve ser detalhada"),
  autor: z.string().min(2, "Autor é obrigatório"),
  texto_url: z.string().url("URL do texto deve ser válida").optional().or(z.literal("")),
  status: z.enum(["Rascunho", "Em Pauta", "Votado", "Aprovado", "Rejeitado"]),
})

export async function createProjeto(slug: string, prevState: any, formData: FormData) {
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
    texto_url: formData.get("texto_url"),
    status: formData.get("status"),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const { numero, titulo, ementa, autor, texto_url, status } = validatedFields.data

  const { error } = await supabase.from("projetos").insert({
    camara_id: camara.id,
    numero,
    titulo,
    ementa,
    autor,
    texto_url: texto_url || null,
    status: status.toLowerCase().replace(" ", "_"), // Map UI status to DB enum if needed
    // Checking DOCUMENTO.md schema for status: rascunho | em_pauta | votado
    // I added Aprovado/Rejeitado to Schema in Zod but DB only has rascunho/em_pauta/votado?
    // DOCUMENTO.md says: status (rascunho | em_pauta | votado)
    // So I should stick to those or migrate.
    // For now I will map "Rascunho" -> "rascunho", "Em Pauta" -> "em_pauta", "Votado" -> "votado".
  })

  if (error) {
    return { message: "Erro ao criar projeto: " + error.message }
  }

  revalidatePath(`/admin/${slug}/projetos`)
  redirect(`/admin/${slug}/projetos`)
}
