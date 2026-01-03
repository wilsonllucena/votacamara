import { getSituacoes } from "@/app/admin/_actions/situacoes"
import { SituacoesClient } from "@/components/admin/projetos/SituacoesClient"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function SituacoesPage({ params }: PageProps) {
  const { slug } = await params
  const situacoes = await getSituacoes(slug)

  return (
    <div className="space-y-6">
      <SituacoesClient slug={slug} situacoes={situacoes as any} />
    </div>
  )
}
