'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const sessaoSchema = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  tipo: z.enum(["ordinaria", "extraordinaria"]),
  status: z.enum(["agendada", "aberta", "encerrada"]),
  data: z.string().min(10, "Data é obrigatória"), // YYYY-MM-DD
  hora: z.string().min(5, "Hora é obrigatória"), // HH:MM
  projeto_ids: z.array(z.string().uuid()),
})

export type SessaoInputs = z.infer<typeof sessaoSchema>

export async function createSessao(slug: string, prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) {
      return { error: "Câmara não encontrada" }
  }

  const validatedFields = sessaoSchema.safeParse({
    titulo: formData.get("titulo"),
    tipo: formData.get("tipo"),
    status: formData.get("status"),
    data: formData.get("data"),
    hora: formData.get("hora"),
    projeto_ids: formData.getAll("projeto_ids"),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const { titulo, tipo, status, data, hora, projeto_ids } = validatedFields.data
  const timestamp = new Date(`${data}T${hora}:00`).toISOString()

  // 3. Create Session
  const { data: sessao, error } = await supabase
    .from("sessoes")
    .insert({
        camara_id: camara.id,
        titulo,
        tipo,
        status,
        iniciou_em: timestamp,
    })
    .select("id")
    .single()

  if (error || !sessao) {
    return { error: "Erro ao criar sessão: " + (error?.message || "Erro desconhecido") }
  }

  // 4. Associate Projects
  if (projeto_ids && projeto_ids.length > 0) {
      const pautaItems = projeto_ids.map((id, index) => ({
          camara_id: camara.id,
          sessao_id: sessao.id,
          projeto_id: id,
          ordem: index + 1,
      }))

      const { error: pautaError } = await supabase
          .from("pauta_itens")
          .insert(pautaItems)

      if (pautaError) {
          console.error("Erro ao associar projetos:", pautaError)
          // We created the session but failed to associate projects. 
          // Not ideal but we can return success with a warning or just error out.
          // Since it's a new session, maybe it's better to tell the user.
          return { error: "Sessão criada, mas erro ao associar projetos: " + pautaError.message }
      }
  }

  revalidatePath(`/admin/${slug}/sessoes`)
  return { success: true }
}

export async function updateSessao(slug: string, id: string, data: SessaoInputs) {
    const supabase = await createClient()

    const validatedFields = sessaoSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: validatedFields.error.message }
    }

    // 2. Fetch Session to get camara_id
    const { data: sessao } = await supabase
      .from("sessoes")
      .select("camara_id")
      .eq("id", id)
      .single()

    if (!sessao) {
        return { error: "Sessão não encontrada" }
    }

    const { titulo, tipo, status, data: date, hora, projeto_ids } = validatedFields.data
    const timestamp = new Date(`${date}T${hora}:00`).toISOString()

    // 3. Update Session
    const { error } = await supabase
        .from("sessoes")
        .update({
            titulo,
            tipo,
            status,
            iniciou_em: timestamp,
        })
        .eq("id", id)

    if (error) {
        return { error: "Erro ao atualizar sessão: " + error.message }
    }

    // 4. Update Projects Association (Sync)
    if (projeto_ids) {
        // Delete existing
        await supabase
            .from("pauta_itens")
            .delete()
            .eq("sessao_id", id)

        // Insert new
        if (projeto_ids.length > 0) {
            const pautaItems = projeto_ids.map((pid, index) => ({
                camara_id: sessao.camara_id,
                sessao_id: id,
                projeto_id: pid,
                ordem: index + 1,
            }))

            const { error: pautaError } = await supabase
                .from("pauta_itens")
                .insert(pautaItems)

            if (pautaError) {
                console.error("Erro ao sincronizar pauta:", pautaError)
            }
        }
    }

    revalidatePath(`/admin/${slug}/sessoes`)
    return { success: true }
}

export async function deleteSessao(slug: string, id: string) {
    const supabase = await createClient()
    
    // Check for linked pauta_itens
    const { data: pautaItems } = await supabase
        .from("pauta_itens")
        .select("id")
        .eq("sessao_id", id)
        .limit(1)
    
    if (pautaItems && pautaItems.length > 0) {
        return { error: "Não é possível excluir uma sessão que já possui itens na pauta." }
    }

    const { error } = await supabase
        .from("sessoes")
        .delete()
        .eq("id", id)

    if(error) {
        return { error: "Erro ao excluir sessão: " + error.message }
    }

    revalidatePath(`/admin/${slug}/sessoes`)
    return { success: true }
}
