"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange?: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    if (onPageChange) {
      onPageChange(page)
    } else {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", page.toString())
      router.push(`?${params.toString()}`)
    }
  }

  // Calculate visible pages
  const delta = 2
  const range = []
  for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
    range.push(i)
  }

  if (currentPage - delta > 2) range.unshift("...")
  if (currentPage + delta < totalPages - 1) range.push("...")

  range.unshift(1)
  if (totalPages > 1) range.push(totalPages)

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="h-9 w-9 border border-border bg-card/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 disabled:opacity-30 shadow-sm"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1.5">
        {range.map((page, index) => (
          <div key={index}>
            {page === "..." ? (
              <span className="px-2 text-muted-foreground">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                onClick={() => handlePageChange(page as number)}
                className={`h-9 min-w-[36px] transition-all duration-200 font-medium ${
                  currentPage === page
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
                    : "border border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-muted shadow-sm"
                }`}
              >
                {page}
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="h-9 w-9 border border-border bg-card/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 disabled:opacity-30 shadow-sm"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
