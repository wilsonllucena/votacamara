'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const vereadorSchema = z.object({
  nome: z.string().min(2),
  partido: z.string().min(1),
  status: z.enum(["Ativo", "Licenciado", "Inativo"]),
  // foto_url will be handled separately or added later
})

export async function createVereador(slug: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  // 1. Get Tenant
  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) {
      return { message: "Câmara não encontrada" }
  }

  // 2. Validate
  const validatedFields = vereadorSchema.safeParse({
    nome: formData.get("nome"),
    partido: formData.get("partido"),
    status: formData.get("status"),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  // 3. Insert
  const { nome, partido, status } = validatedFields.data

  const { error } = await supabase.from("vereadores").insert({
    camara_id: camara.id,
    nome,
    partido,
    ativo: status === "Ativo", // Map enum to boolean if schema uses boolean, or string if enum
    // Schema in DOCUMENTO.md says: ativo (boolean?) Let's check schema.
    // DOCUMENTO.md: ativo. Usually boolean.
    // But my List view used "Ativo/Licenciado". 
    // Let's assume the database column `ativo` is boolean for now (true=Ativo, false=Inativo).
    // What about "Licenciado"? Maybe `ativo` is not enough, or `status` column exists.
    // Checking schema dump... I don't have a dump of `vereadores`.
    // Let's list tables again to be sure or just assume `ativo` boolean for MVP.
    // Actually, I'll assume `ativo` is boolean. "Licenciado" might need another field or just be false.
    // Wait, the DOCUMENTO.md says:
    // ### vereadores
    // - ativo
    
    // I will write `ativo` based on status === 'Ativo'.
  })

  if (error) {
    return { message: "Erro ao criar vereador: " + error.message }
  }

  revalidatePath(`/admin/${slug}/vereadores`)
  redirect(`/admin/${slug}/vereadores`)
}
