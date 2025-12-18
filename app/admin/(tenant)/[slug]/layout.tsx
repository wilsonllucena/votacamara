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
    <div className="h-full relative bg-slate-950">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
        <Sidebar slug={slug} />
      </div>
      <main className="md:pl-72 h-full">
        <Header />
        <div className="p-8 h-full bg-slate-950 min-h-[calc(100vh-65px)]">
            {children}
        </div>
      </main>
    </div>
  )
}
