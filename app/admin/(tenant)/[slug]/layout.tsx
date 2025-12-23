import { Sidebar } from "@/components/admin/Sidebar"
import { Header } from "@/components/admin/Header"
import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider"
import { SidebarProvider } from "@/components/admin/SidebarProvider"
import { AdminLayoutWrapper } from "@/components/admin/AdminLayoutWrapper"
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

  // Fetch profile to get name and role
  const { data: profile } = await supabase
      .from("profiles")
      .select("nome, role")
      .eq("user_id", user.id)
      .single()

  // Fallback or handle missing profile
  const userProfile = {
      name: profile?.nome || "Usuário",
      role: profile?.role || "MEMBRO"
  }

  return (
    <AdminThemeProvider>
      <SidebarProvider>
        <AdminLayoutWrapper
          sidebar={<Sidebar slug={slug} userProfile={userProfile} />}
          header={<Header slug={slug} userProfile={userProfile} />}
        >
          {children}
        </AdminLayoutWrapper>
      </SidebarProvider>
    </AdminThemeProvider>
  )
}
