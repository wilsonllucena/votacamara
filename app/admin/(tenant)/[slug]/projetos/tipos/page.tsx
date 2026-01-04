import { Suspense } from "react"
import { getTiposMateria } from "@/app/admin/_actions/projetos"
import { TiposMateriaClient } from "@/components/admin/projetos/TiposMateriaClient"

export default async function TiposMateriaPage() {
    const tipos = await getTiposMateria()

    return (
        <div className="py-6">
            <Suspense fallback={<div className="text-white">Carregando tipos...</div>}>
                <TiposMateriaClient tipos={tipos || []} />
            </Suspense>
        </div>
    )
}
