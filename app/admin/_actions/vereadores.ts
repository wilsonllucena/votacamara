'use server'

import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { revalidatePath } from "next/cache"

const councilorActionSchema = {
  nome: (val: any) => typeof val === 'string' && val.length >= 3,
  partido: (val: any) => typeof val === 'string' && val.length >= 1,
  cpf: (val: any) => typeof val === 'string' && val.replace(/\D/g, '').length === 11,
  email: (val: any) => typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  telefone: (val: any) => typeof val === 'string' && val.replace(/\D/g, '').length >= 10,
}

export async function createVereador(slug: string, prevState: any, formData: FormData) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const nome = formData.get("nome") as string
  const partido = formData.get("partido") as string
  const cpf = formData.get("cpf") as string
  const email = formData.get("email") as string
  const telefone = formData.get("telefone") as string
  const ativo = formData.get("ativo") === "on" || formData.get("ativo") === "true"
  const isPresidente = formData.get("isPresidente") === "on" || formData.get("isPresidente") === "true"


  // Simple validation
  if (!councilorActionSchema.nome(nome)) return { error: "Nome inválido" }
  if (!councilorActionSchema.partido(partido)) return { error: "Partido inválido" }
  if (!councilorActionSchema.cpf(cpf)) return { error: "CPF inválido" }
  if (!councilorActionSchema.email(email)) return { error: "Email inválido" }
  if (!councilorActionSchema.telefone(telefone)) return { error: "Telefone inválido" }

  const cleanCpf = cpf.replace(/\D/g, '')
  const password = cleanCpf.substring(0, 6)

  // 1. Get Tenant
  const { data: camara, error: camaraError } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (camaraError || !camara) {
    return { error: "Câmara não encontrada" }
  }

  // 2. Check for existing president if this one is intended to be president
  if (isPresidente) {
    const { data: existingPresident } = await supabase
      .from("profiles")
      .select("id")
      .eq("camara_id", camara.id)
      .eq("role", "PRESIDENTE")
      .single()
    
    if (existingPresident) {
      return { error: "Já existe um presidente cadastrado para esta Câmara. Desative o cargo do atual antes de promover outro." }
    }
  }

  // 2. Create Auth User
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome }
  })

  if (authError) {
    return { error: "Erro ao criar usuário: " + authError.message }
  }

  // 3. Create Profile
  const { error: profileError } = await adminClient.from("profiles").insert({
    user_id: authUser.user.id,
    camara_id: camara.id,
    nome,
    role: isPresidente ? 'PRESIDENTE' : 'VEREADOR',
    email,
    telefone
  })

  if (profileError) {
    // Cleanup auth user if profile fails
    await adminClient.auth.admin.deleteUser(authUser.user.id)
    return { error: "Erro ao criar perfil: " + profileError.message }
  }

  // 4. Create Councilor
  const { error: councilorError } = await adminClient.from("vereadores").insert({
    camara_id: camara.id,
    user_id: authUser.user.id,
    nome,
    partido,
    cpf: cleanCpf,
    ativo,
    is_presidente: isPresidente,
  })

  if (councilorError) {
    // Cleanup
    await adminClient.auth.admin.deleteUser(authUser.user.id)
    return { error: "Erro ao criar vereador: " + councilorError.message }
  }

  revalidatePath(`/admin/${slug}/vereadores`)
  return { success: true }
}

export async function updateVereador(slug: string, id: string, data: any) {
  const adminClient = createAdminClient()


  // 1. Get user_id from vereadores
  const { data: vereador, error: fetchError } = await adminClient
    .from("vereadores")
    .select("user_id")
    .eq("id", id)
    .single()

  if (fetchError) return { error: fetchError.message }

  // 2. Check for existing president if promoting to president
  if (data.isPresidente) {
    const { data: currentProfile } = await adminClient
      .from("profiles")
      .select("id, role, camara_id")
      .eq("user_id", vereador.user_id)
      .single()

    if (currentProfile?.role !== 'PRESIDENTE') {
      const { data: existingPresident } = await adminClient
        .from("profiles")
        .select("id")
        .eq("camara_id", currentProfile?.camara_id)
        .eq("role", "PRESIDENTE")
        .single()
      
      if (existingPresident) {
        return { error: "Já existe um presidente cadastrado para esta Câmara. Remova o cargo do atual antes de promover este vereador." }
      }
    }
  }

  // 3. Update Councilor
  const { error: councilorError } = await adminClient
    .from("vereadores")
    .update({
      nome: data.nome,
      partido: data.partido,
      cpf: data.cpf.replace(/\D/g, ''),
      ativo: data.ativo,
      is_presidente: data.isPresidente,
    })
    .eq("id", id)

  if (councilorError) {
    return { error: councilorError.message }
  }

  // 3. Update Profile
  if (vereador?.user_id) {
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        role: data.isPresidente ? 'PRESIDENTE' : 'VEREADOR'
      })
      .eq("user_id", vereador.user_id)
    
    if (profileError) {
      // We don't necessarily return error here if the councilor was updated, 
      // but it's good to know.
    }
  }

  revalidatePath(`/admin/${slug}/vereadores`)
  return { success: true }
}

export async function toggleVereadorStatus(slug: string, id: string, currentStatus: boolean) {
  const adminClient = createAdminClient()


  const { error } = await adminClient
    .from("vereadores")
    .update({ ativo: !currentStatus })
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/${slug}/vereadores`)
  return { success: true }
}
