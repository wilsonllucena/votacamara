import { AtasClient } from "@/components/admin/sessoes/AtasClient"

interface AtasPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function AtasPage({ params }: AtasPageProps) {
  const { slug } = await params

  // Mock data for initial implementation
  const initialAtas = [
    {
      id: "1",
      sessao_nome: "Sessão Ordinária 01/2024",
      data: "2024-01-10",
      status: "Gerada",
      arquivo_url: "#",
    },
    {
      id: "2",
      sessao_nome: "Sessão Ordinária 02/2024",
      data: "2024-01-17",
      status: "Pendente",
      arquivo_url: null,
    }
  ]

  return (
    <div className="p-6">
      <AtasClient slug={slug} initialAtas={initialAtas} />
    </div>
  )
}
