'use server'

import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getMesaDiretora(camaraId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("mesa_diretora")
    .select(`
      id,
      cargo_id,
      vereador_id,
      cargos (
        id,
        nome
      ),
      vereadores (
        id,
        nome,
        partido,
        foto_url
      )
    `)
    .eq("camara_id", camaraId)

  if (error) {
    console.error("Error fetching mesa diretora:", error)
    return []
  }

  return data
}

export async function upsertMesaMember(slug: string, camaraId: string, data: { id?: string, cargo_id: string, vereador_id: string }) {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from("mesa_diretora")
    .upsert({
      ...(data.id ? { id: data.id } : {}),
      camara_id: camaraId,
      cargo_id: data.cargo_id,
      vereador_id: data.vereador_id
    }, { onConflict: 'camara_id, cargo_id' })

  if (error) {
    console.error("Error upserting mesa member:", error)
    if (error.code === '23505') {
       return { error: "Este cargo já está ocupado na Mesa Diretora." }
    }
    return { error: error.message }
  }

  revalidatePath(`/admin/${slug}/mesa-diretora`)
  return { success: true }
}

export async function removeMesaMember(slug: string, id: string) {
    const adminClient = createAdminClient()
    
    const { error } = await adminClient
        .from("mesa_diretora")
        .delete()
        .eq("id", id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/${slug}/mesa-diretora`)
    return { success: true }
}
