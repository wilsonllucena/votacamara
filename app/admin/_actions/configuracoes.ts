'use server'

import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const camaraSettingsSchema = z.object({
  nome: z.string().min(3, "Mínimo 3 caracteres"),
  telefone: z.string().optional().or(z.literal("")),
  cnpj: z.string().optional().or(z.literal("")),
  logo_url: z.string().url("URL inválida").optional().or(z.literal("")),
  endereco: z.string().optional().or(z.literal("")),
  cidade: z.string().optional().or(z.literal("")),
  uf: z.string().optional().or(z.literal("")),
})

export async function updateCamaraSettings(slug: string, data: any) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const validated = camaraSettingsSchema.safeParse(data)
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Dados inválidos"
    return { error: firstError }
  }

  const { error } = await adminClient
    .from("camaras")
    .update({
      nome: validated.data.nome,
      telefone: validated.data.telefone,
      cnpj: validated.data.cnpj?.replace(/\D/g, ''),
      logo_url: validated.data.logo_url || null,
      endereco: validated.data.endereco || null,
      cidade: validated.data.cidade || null,
      uf: validated.data.uf || null,
    })
    .eq("slug", slug)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/${slug}/configuracoes`)
  return { success: true }
}

export async function updateUserPassword(data: { currentPassword?: string, newPassword: string }) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: data.newPassword
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
