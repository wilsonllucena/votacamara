import { Sidebar } from "@/components/admin/Sidebar"
import { Header } from "@/components/admin/Header"
import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider"
import { SidebarProvider } from "@/components/admin/SidebarProvider"
import { AdminLayoutWrapper } from "@/components/admin/AdminLayoutWrapper"
import { GlobalPresence } from "@/components/admin/GlobalPresence"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
      redirect("/login")
  }

  // Fetch profile to get name, role and camara_id
  const { data: profile } = await supabase
      .from("profiles")
      .select("nome, role, camara_id")
      .eq("user_id", user.id)
      .single()

  // Fallback or handle missing profile
  const userProfile = {
      name: profile?.nome || "Usuário",
      role: profile?.role || "MEMBRO"
  }

  const camaraId = profile?.camara_id || ""

  // Fetch camara name
  const { data: camara } = await supabase
      .from("camaras")
      .select("nome")
      .eq("id", camaraId)
      .single()

  const camaraNome = camara?.nome || ""

  // 6. Define Abilities with CASL
  const { defineAbilityFor } = await import("@/lib/casl/ability")
  const ability = defineAbilityFor(profile?.role || 'PUBLICO')
  const rules = ability.rules

  return (
    <AdminThemeProvider>
      <SidebarProvider>
        <GlobalPresence userId={user.id} camaraId={camaraId} />
        <AdminLayoutWrapper
          sidebar={<Sidebar slug={slug} camaraNome={camaraNome} userProfile={userProfile} rules={rules as any} />}
          header={<Header slug={slug} userProfile={userProfile} camaraNome={camaraNome} rules={rules as any} />}
        >
          {children}
        </AdminLayoutWrapper>
      </SidebarProvider>
    </AdminThemeProvider>
  )
}
