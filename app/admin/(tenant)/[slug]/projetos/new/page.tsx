import { ProjetoForm } from "@/components/admin/ProjetoForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewProjetoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Link href={`/admin/${slug}/projetos`}>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Novo Projeto</h2>
                <p className="text-zinc-400">Cadastre uma nova propositura legislativa.</p>
            </div>
        </div>

        <ProjetoForm slug={slug} />
    </div>
  )
}
