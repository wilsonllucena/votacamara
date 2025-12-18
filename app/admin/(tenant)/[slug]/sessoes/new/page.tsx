import { SessaoForm } from "@/components/admin/SessaoForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewSessaoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Link href={`/admin/${slug}/sessoes`}>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Nova Sessão</h2>
                <p className="text-zinc-400">Agende uma nova sessão plenária.</p>
            </div>
        </div>

        <SessaoForm slug={slug} />
    </div>
  )
}
