import { AtasClient } from "@/components/admin/sessoes/AtasClient"
import { getAtas } from "@/app/admin/_actions/atas"

const ITEMS_PER_PAGE = 10

export default async function ComissoesAtasPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ slug: string }> 
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const { page = "1", search = "" } = await searchParams

  const currentPage = Number(page) || 1
  const { data: atas, count } = await getAtas(slug, 'comissao', currentPage, search as string, ITEMS_PER_PAGE)
  
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Atas de Comissões</h1>
        <p className="text-muted-foreground text-sm">Registro oficial das deliberações e pareceres das comissões.</p>
      </div>
      <AtasClient 
        slug={slug} 
        initialAtas={(atas as any[]) || []} 
        pagination={{
            currentPage,
            totalPages
        }}
      />
    </div>
  )
}
