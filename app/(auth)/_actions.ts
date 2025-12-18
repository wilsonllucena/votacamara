'use server'

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { z } from "zod"

const registerSchema = z.object({
  camara_nome: z.string().min(3, "Nome da câmara deve ter no mínimo 3 caracteres"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  uf: z.string().length(2, "UF deve ter 2 caracteres"),
  admin_nome: z.string().min(2, "Nome do admin obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
})

export async function loginAction(prevState: any, formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const validated = loginSchema.safeParse(data)

  if (!validated.success) {
    return { error: validated.error.message }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: "Email ou senha incorretos." }
  }

  // Auth successful, now find the user's camara to redirect
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Erro ao recuperar usuário." }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('camara_id')
    .eq('user_id', user.id)
    .single()

  if (!profile || !profile.camara_id) {
    return { error: "Perfil de usuário incompleto." }
  }

  const { data: camara } = await supabase
    .from('camaras')
    .select('slug')
    .eq('id', profile.camara_id)
    .single()

  if (!camara || !camara.slug) {
    return { error: "Erro ao localizar a câmara do usuário." }
  }

  redirect(`/admin/${camara.slug}/dashboard`)
}

import { createAdminClient } from "@/utils/supabase/admin"

// ... imports remain the same ...

export async function registerAction(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    const rawData = {
        camara_nome: formData.get("camara_nome") as string,
        cidade: formData.get("cidade") as string,
        uf: formData.get("uf") as string,
        admin_nome: formData.get("admin_nome") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    }

    const validated = registerSchema.safeParse(rawData)

    if (!validated.success) {
        return { error: validated.error.message }
    }

    // 1. Sign Up User (Use standard client to handle session cookies automatically if possible, 
    // but typically Server Actions + simple signUp might not set cookies for subsequent requests immediately 
    // unless we use the properly configured createClient from server.ts which we ARE doing).
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: rawData.email,
        password: rawData.password,
        options: {
            data: {
                full_name: rawData.admin_nome,
            }
        }
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: "Erro ao criar usuário." }
    }

    // 2. Create Camara (Tenant) - USING ADMIN CLIENT
    const slug = rawData.camara_nome
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

    const { data: camaraData, error: camaraError } = await supabaseAdmin
        .from('camaras')
        .insert({
            nome: rawData.camara_nome,
            cidade: rawData.cidade,
            uf: rawData.uf.toUpperCase(),
            slug: slug
        })
        .select()
        .single()

    if (camaraError) {
        console.error("Camara Create Error:", camaraError)
        return { error: "Erro ao criar Câmara. Tente um nome diferente." }
    }

    // 3. Create Profile linked to Camara - USING ADMIN CLIENT
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            user_id: authData.user.id,
            camara_id: camaraData.id,
            nome: rawData.admin_nome,
            role: 'ADMIN'
        })

    if (profileError) {
        console.error("Profile Create Error:", profileError)
        // Cleanup could go here (delete user/camara), but for MVP we return error
        return { error: "Erro ao criar perfil de administrador." }
    }

    // Redirect to dashboard
    redirect(`/admin/${slug}/dashboard`)
}
