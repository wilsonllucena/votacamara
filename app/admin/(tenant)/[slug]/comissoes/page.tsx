import { ComissoesClient } from "@/components/admin/comissoes/ComissoesClient"

interface ComissoesPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ComissoesPage({ params }: ComissoesPageProps) {
  const { slug } = await params

  // Mock data for initial implementation
  const initialComissoes = [
    {
      id: "1",
      nome: "Comissão de Constituição e Justiça",
      tipo: "Permanente",
      descricao: "Análise da legalidade e constitucionalidade das propostas.",
      membros_count: 5,
      materias_count: 3,
    },
    {
      id: "2",
      nome: "Comissão de Finanças e Orçamento",
      tipo: "Permanente",
      descricao: "Acompanhamento orçamentário e financeiro do município.",
      membros_count: 3,
      materias_count: 1,
    }
  ]

  // Mock vereadores for selection
  const vereadores = [
    { id: "v1", nome: "João Silva", partido: "PT", isMesa: true, cargoMesa: "Presidente" },
    { id: "v2", nome: "Maria Oliveira", partido: "PL", isMesa: true, cargoMesa: "Secretária" },
    { id: "v3", nome: "Carlos Souza", partido: "MDB", isMesa: false },
    { id: "v4", nome: "Ana Santos", partido: "PSDB", isMesa: false },
    { id: "v5", nome: "Pedro Lima", partido: "PSD", isMesa: false },
  ]

  // Mock materias for selection
  const materias = [
    { id: "m1", numero: "001/2024", titulo: "Projeto de Lei - Reforma Administrativa" },
    { id: "m2", numero: "015/2024", titulo: "Indicação - Pavimentação Rua Principal" },
    { id: "m3", numero: "042/2024", titulo: "Decreto Legislativo - Título Honorário" },
  ]

  return (
    <div className="p-6">
      <ComissoesClient 
        slug={slug} 
        initialComissoes={initialComissoes} 
        vereadores={vereadores}
        materias={materias}
      />
    </div>
  )
}
