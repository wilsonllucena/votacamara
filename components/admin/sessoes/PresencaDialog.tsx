"use client"

import { useState, useEffect, useTransition } from "react"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    UserCheck, 
    UserX, 
    FileWarning, 
    Save, 
    Loader2, 
    AlertCircle,
    User
} from "lucide-react"
import { getPresencas, upsertPresencasBatch, initializePresencas } from "@/app/admin/_actions/presencas"
import { cn } from "@/lib/utils"

interface PresencaDialogProps {
    isOpen: boolean
    onClose: () => void
    session: any
    slug: string
    camaraId: string
}

export function PresencaDialog({ 
    isOpen, 
    onClose, 
    session, 
    slug, 
    camaraId 
}: PresencaDialogProps) {
    const [isPending, startTransition] = useTransition()
    const [isLoading, setIsLoading] = useState(true)
    const [presencas, setPresencas] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && session?.id) {
            loadPresencas()
        }
    }, [isOpen, session?.id])

    const loadPresencas = async () => {
        setIsLoading(true)
        setError(null)
        
        // 1. Initialize if needed
        const initResult = await initializePresencas(slug, session.id, camaraId)
        if (initResult.error) {
            setError(initResult.error)
            setIsLoading(false)
            return
        }

        // 2. Fetch
        const result = await getPresencas(session.id)
        if (result.error) {
            setError(result.error)
        } else {
            setPresencas(result.data || [])
        }
        setIsLoading(false)
    }

    const handleStatusChange = (vereadorId: string, status: 'presente' | 'ausente' | 'justificado') => {
        setPresencas(prev => prev.map(p => 
            p.vereador_id === vereadorId ? { ...p, status } : p
        ))
    }

    const handleSave = async () => {
        startTransition(async () => {
            const batchData = presencas.map(p => ({
                id: p.id,
                camara_id: camaraId,
                sessao_id: session.id,
                vereador_id: p.vereador_id,
                status: p.status,
                justificativa: p.justificativa
            }))

            const result = await upsertPresencasBatch(slug, batchData)
            if (result.error) {
                setError(result.error)
            } else {
                onClose()
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-border bg-card rounded-2xl sm:rounded-3xl">
                <DialogHeader className="p-4 sm:p-6 border-b border-border bg-muted/30">
                    <DialogTitle className="text-xl sm:text-2xl font-black flex items-center gap-3">
                        <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        Lista de Presença
                    </DialogTitle>
                    <DialogDescription className="font-medium text-xs sm:text-sm truncate">
                        {session?.titulo} - {session?.iniciou_em ? new Date(session.iniciou_em).toLocaleDateString('pt-BR') : ''}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Carregando parlamentares...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-xs sm:text-sm font-bold">{error}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {presencas.map((p) => (
                                <div key={p.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 transition-all gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner overflow-hidden">
                                            {p.vereadores?.foto_url ? (
                                                <img src={p.vereadores.foto_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-black text-foreground text-sm sm:text-base truncate leading-tight" title={p.vereadores?.nome}>
                                                {p.vereadores?.nome}
                                            </p>
                                            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-tighter truncate opacity-70">
                                                {p.vereadores?.partido}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center sm:flex-row justify-between gap-2">
                                        <div className="grid grid-cols-3 sm:flex items-center gap-1.5 w-full sm:w-auto">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleStatusChange(p.vereador_id, 'presente')}
                                                className={cn(
                                                    "h-10 sm:h-9 px-2 sm:px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2 transition-all flex items-center justify-center",
                                                    p.status === 'presente' 
                                                        ? "bg-green-500 text-white hover:bg-green-600 shadow-md shadow-green-500/20" 
                                                        : "text-muted-foreground hover:bg-green-500/10 hover:text-green-500 border border-transparent hover:border-green-500/20"
                                                )}
                                                title="Presente"
                                            >
                                                <UserCheck className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                                <span className="hidden sm:inline">Presente</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleStatusChange(p.vereador_id, 'ausente')}
                                                className={cn(
                                                    "h-10 sm:h-9 px-2 sm:px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2 transition-all flex items-center justify-center",
                                                    p.status === 'ausente' 
                                                        ? "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20" 
                                                        : "text-muted-foreground hover:bg-red-500/10 hover:text-red-500 border border-transparent hover:border-red-500/20"
                                                )}
                                                title="Ausente"
                                            >
                                                <UserX className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                                <span className="hidden sm:inline">Ausente</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleStatusChange(p.vereador_id, 'justificado')}
                                                className={cn(
                                                    "h-10 sm:h-9 px-2 sm:px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2 transition-all flex items-center justify-center",
                                                    p.status === 'justificado' 
                                                        ? "bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20" 
                                                        : "text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500 border border-transparent hover:border-amber-500/20"
                                                )}
                                                title="Justificar"
                                            >
                                                <FileWarning className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                                <span className="hidden sm:inline">Justificar</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 sm:p-6 border-t border-border bg-muted/30 flex flex-col-reverse sm:flex-row gap-3 sm:gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isPending} className="w-full sm:w-auto h-11 sm:h-10 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isPending || isLoading} className="w-full sm:w-auto h-11 sm:h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2 px-8">
                        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Salvar Presenças
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
