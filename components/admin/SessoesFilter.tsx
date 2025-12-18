"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export function SessoesFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilter = (date: string) => {
    const params = new URLSearchParams(searchParams)
    if (date) {
        params.set("data", date)
    } else {
        params.delete("data")
    }
    // Reset page on filter change
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
        <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
                type="date"
                onChange={(e) => handleFilter(e.target.value)}
                defaultValue={searchParams.get("data") || ""}
                className="bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
        </div>
        {(searchParams.get("data")) && (
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleFilter("")}
                className="text-zinc-400 hover:text-white"
            >
                Limpar
            </Button>
        )}
    </div>
  )
}
