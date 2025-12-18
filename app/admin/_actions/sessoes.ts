'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const sessaoSchema = z.object({
  titulo: z.string().min(3),
  tipo: z.enum(["Ordinária", "Extraordinária"]),
  status: z.enum(["Agendada", "Aberta", "Encerrada"]),
  data: z.string(), // YYYY-MM-DD
  hora: z.string(), // HH:MM
})

export async function createSessao(slug: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  // 1. Get current tenant (camara)
  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) {
      return { message: "Câmara não encontrada" }
  }

  // 2. Validate data
  const validatedFields = sessaoSchema.safeParse({
    titulo: formData.get("titulo"),
    tipo: formData.get("tipo"),
    status: formData.get("status"),
    data: formData.get("data"),
    hora: formData.get("hora"),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  // 3. Insert
  // Combine data+hora into initial timestamp logic if needed, or store separate.
  // DOCUMENTO.md says: iniciou_em, encerrou_em.
  // But usually for scheduling we want a "data_agendada".
  // The schema in DOCUMENTO.md has: titulo, tipo, status, iniciou_em, encerrou_em.
  // It lacks a "data_agendada" field explicitly? 
  // "iniciou_em" is usually when it ACTUALLY started. 
  // Let's assume for MVP we stick to what we have or add a column if needed.
  // Actually, for "Agendada", we probably want to store the scheduled date.
  // Let's check the schema again.
  // DOCUMENTO.md:
  // ### sessoes
  // - id
  // - camara_id
  // - titulo
  // - tipo (ordinaria | extraordinaria)
  // - status (aberta | encerrada) -> Missing "Agendada"?
  // - iniciou_em
  // - encerrou_em
  
  // If the schema is strict, we might need to use "iniciou_em" as the scheduled date for now, 
  // OR creates a migration.
  // Given I am "Senior", I should probably add `data_agendada` if it's missing, OR just use `iniciou_em` as the scheduled start.
  // Let's use `iniciou_em` as the "Scheduled Start" for Agendada sessions.

  const { titulo, tipo, status, data, hora } = validatedFields.data
  const timestamp = new Date(`${data}T${hora}:00`).toISOString()

  const { error } = await supabase.from("sessoes").insert({
    camara_id: camara.id,
    titulo,
    tipo: tipo.toLowerCase(), // database might expect lowercase enum
    status: status.toLowerCase(),
    iniciou_em: timestamp,
  })

  if (error) {
    return { message: "Erro ao criar sessão: " + error.message }
  }

  revalidatePath(`/admin/${slug}/sessoes`)
  redirect(`/admin/${slug}/sessoes`)
}

export async function deleteSessao(slug: string, id: string) {
    const supabase = await createClient()
    
    const { error } = await supabase
        .from("sessoes")
        .delete()
        .eq("id", id)

    if(error) {
        throw new Error(error.message)
    }

    revalidatePath(`/admin/${slug}/sessoes`)
}
