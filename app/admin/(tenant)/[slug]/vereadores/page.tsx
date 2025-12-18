import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreVertical, Search, Filter } from "lucide-react"

// Mock Data
const vereadores = [
  { id: 1, nome: "Carlos Silva", partido: "PSD", status: "Ativo", foto: "bg-blue-500/20 text-blue-500" },
  { id: 2, nome: "Ana Pereira", partido: "MDB", status: "Ativo", foto: "bg-purple-500/20 text-purple-500" },
  { id: 3, nome: "Roberto Santos", partido: "PL", status: "Ativo", foto: "bg-green-500/20 text-green-500" },
  { id: 4, nome: "Julia Oliveira", partido: "PT", status: "Licenciado", foto: "bg-yellow-500/20 text-yellow-500" },
  { id: 5, nome: "Marcos Lima", partido: "PP", status: "Ativo", foto: "bg-red-500/20 text-red-500" },
]

export default async function VereadoresPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <div className="space-y-6">
       {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Vereadores</h2>
            <p className="text-slate-400">Gerencie os parlamentares da legislatura atual.</p>
         </div>
         <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-blue-500/50">
            <Plus className="mr-2 h-4 w-4" /> Novo Vereador
         </Button>
      </div>

      {/* Filters */}
        <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Buscar por nome ou partido..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
            </div>
            <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800">
                <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button>
        </div>

      {/* List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg shadow-blue-900/5">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
                    <tr>
                        <th className="px-6 py-4">Parlamentar</th>
                        <th className="px-6 py-4">Partido</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {vereadores.map((vereador) => (
                        <tr key={vereador.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${vereador.foto}`}>
                                    {vereador.nome.substring(0,2).toUpperCase()}
                                </div>
                                {vereador.nome}
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-bold">
                                    {vereador.partido}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <Badge variant={vereador.status === "Ativo" ? "default" : "secondary"} className={
                                    vereador.status === "Ativo" 
                                    ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20" 
                                    : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
                                }>
                                    {vereador.status}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}
