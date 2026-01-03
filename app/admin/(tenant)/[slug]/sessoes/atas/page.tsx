import { AtasClient } from "@/components/admin/sessoes/AtasClient"
import { getAtas } from "@/app/admin/_actions/atas"

const ITEMS_PER_PAGE = 10

export default async function AtasPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ slug: string }> 
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const { page = "1", search = "" } = await searchParams

  const currentPage = Number(page) || 1
  const { data: atas, count } = await getAtas(slug, 'sessao', currentPage, search as string, ITEMS_PER_PAGE)
  
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1

  return (
    <div className="p-6">
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
