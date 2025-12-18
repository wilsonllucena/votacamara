"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
    totalPages: number
    currentPage: number
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams)
        params.set("page", page.toString())
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex items-center justify-center gap-4 mt-8">
            <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="border-slate-800 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-400">
                Página <span className="text-white font-medium">{currentPage}</span> de <span className="text-white font-medium">{totalPages}</span>
            </span>
             <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="border-slate-800 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
