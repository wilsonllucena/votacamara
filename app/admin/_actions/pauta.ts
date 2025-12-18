'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const pautaItemSchema = z.object({
  sessao_id: z.string().uuid(),
  projeto_id: z.string().uuid(),
  ordem: z.number().int().default(0),
})

export async function addProjectToPauta(slug: string, sessaoId: string, projetoId: string) {
  const supabase = await createClient()

  // 1. Get current max order
  const { data: existingItems } = await supabase
    .from("pauta_itens")
    .select("ordem")
    .eq("sessao_id", sessaoId)
    .order("ordem", { ascending: false })
    .limit(1)

  const nextOrder = (existingItems?.[0]?.ordem || 0) + 1

  // 2. Insert
  const { error } = await supabase.from("pauta_itens").insert({
    sessao_id: sessaoId,
    projeto_id: projetoId,
    ordem: nextOrder,
    // status? Maybe 'em_pauta'
  })

  if (error) {
      // Check for duplicates
      if (error.code === '23505') { // Unique violation
          return { message: "Projeto já está na pauta." }
      }
      return { message: "Erro ao adicionar item: " + error.message }
  }

  revalidatePath(`/admin/${slug}/sessoes/${sessaoId}/pauta`)
  return { success: true }
}

export async function removeProjectFromPauta(slug: string, itemId: string) {
    const supabase = await createClient()
    
    // We need usage of sessaoId to revalidate correct path. 
    // Or just revalidate the layout? 
    // Ideally we pass sessaoId or fetch it.
    
    const { data: item } = await supabase.from("pauta_itens").select("sessao_id").eq("id", itemId).single()
    
    const { error } = await supabase
        .from("pauta_itens")
        .delete()
        .eq("id", itemId)

    if(error) {
        return { message: error.message }
    }
    
    if (item) {
        revalidatePath(`/admin/${slug}/sessoes/${item.sessao_id}/pauta`)
    }
    return { success: true }
}
