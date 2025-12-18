import { Sidebar } from "@/components/admin/Sidebar"
import { Header } from "@/components/admin/Header"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <div className="h-full relative bg-black">
      <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-80 bg-black border-r border-zinc-900">
        <Sidebar slug={slug} />
      </div>
      <main className="md:pl-64 h-full">
        <Header slug={slug} />
        <div className="px-8 pb-8 h-full bg-black min-h-[calc(100vh-56px)]">
            {children}
        </div>
      </main>
    </div>
  )
}
