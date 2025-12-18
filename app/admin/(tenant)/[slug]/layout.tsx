import { Sidebar } from "@/components/admin/Sidebar"
import { Header } from "@/components/admin/Header"
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
    <div className="h-full relative bg-black">
      <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-80 bg-black border-r border-zinc-900">
        <Sidebar slug={slug} userProfile={userProfile} />
      </div>
      <main className="md:pl-64 h-full">
        <Header slug={slug} userProfile={userProfile} />
        <div className="px-8 pb-8 h-full bg-black min-h-[calc(100vh-56px)]">
            {children}
        </div>
      </main>
    </div>
  )
}
