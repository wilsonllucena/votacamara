import { AtasClient } from "@/components/admin/sessoes/AtasClient"

interface ComissoesAtasPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ComissoesAtasPage({ params }: ComissoesAtasPageProps) {
  const { slug } = await params

  // Mock data for initial implementation
  const initialAtas = [
    {
      id: "c1",
      sessao_nome: "Reunião CCJ - 02/2024",
      data: "2024-02-15",
      status: "Gerada",
      arquivo_url: "#",
    },
    {
      id: "c2",
      sessao_nome: "Reunião Orçamento - 01/2024",
      data: "2024-02-18",
      status: "Pendente",
      arquivo_url: null,
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Atas de Comissões</h1>
        <p className="text-muted-foreground text-sm">Registro oficial das deliberações e pareceres das comissões.</p>
      </div>
      <AtasClient slug={slug} initialAtas={initialAtas} />
    </div>
  )
}
