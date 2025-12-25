"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
    Play, 
    Square, 
    Vote, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    User,
    ChevronRight,
    Timer
} from "lucide-react"
import { 
    startSession, 
    endSession, 
    openVoting, 
    closeVoting 
} from "@/app/admin/_actions/sessao_control"
import { cn } from "@/lib/utils"

import { usePresenceStore } from "@/store/use-presence-store"
import { useSessionStore } from "@/store/use-session-store"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface SessaoManagerProps {
    sessao: any
    councilors: any[]
    pautaItems: any[]
    activeVoting: any
    slug: string
}

export function SessaoManager({ sessao, councilors, pautaItems, activeVoting: initialActiveVoting, slug }: SessaoManagerProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isPending, startTransition] = useTransition()
    
    // ConfirmDialog State
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean
        title: string
        description: string
        onConfirm?: () => void
        variant?: "default" | "destructive"
        type?: "confirm" | "alert"
    }>({
        isOpen: false,
        title: "",
        description: "",
    })

    const showAlert = (title: string, description: string) => {
        setConfirmConfig({
            isOpen: true,
            title,
            description,
            type: "alert",
            variant: "default",
        })
    }
    
    // Zustand Stores
    const { onlineUsers } = usePresenceStore()
    const { 
        votes, 
        activeVoting, 
        sessaoStatus, 
        initialize: initSession, 
        cleanup: cleanupSession,
        setActiveVoting
    } = useSessionStore()

    const [selectedProjectId, setSelectedProjectId] = useState<string>("")
    const [useTimer, setUseTimer] = useState(false)
    const [timerValue, setTimerValue] = useState(60) // Default 60 seconds
    const [timeLeft, setTimeLeft] = useState<number | null>(null)

    // Initialize Global Session Store
    useEffect(() => {
        initSession(sessao.id, sessao.camara_id, {
            votes: [], // Will be fetched below
            activeVoting: initialActiveVoting,
            sessaoStatus: sessao.status
        })

        // Initial fetch for votes if there's an active voting
        if (initialActiveVoting) {
            supabase
                .from("votos")
                .select("*")
                .eq("votacao_id", initialActiveVoting.id)
                .then(({ data }) => {
                    useSessionStore.getState().setVotes(data || [])
                })
        }

        return () => {
            cleanupSession()
        }
    }, [sessao.id, sessao.camara_id, initialActiveVoting, sessao.status, initSession, cleanupSession, supabase])

    // Sync Local State with Prop Changes (for activeVoting specifically if revalidated)
    useEffect(() => {
        if (initialActiveVoting) {
            setActiveVoting(initialActiveVoting)
        }
    }, [initialActiveVoting, setActiveVoting])
    
    // 2. Timer Logic
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) {
            return
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => (prev !== null ? prev - 1 : null))
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, activeVoting])

    // Actions
    const handleStartSession = async () => {
        startTransition(async () => {
            const result = await startSession(slug, sessao.id)
            if (result?.error) showAlert("Erro", result.error)
            else router.refresh()
        })
    }

    const handleEndSession = async () => {
        setConfirmConfig({
            isOpen: true,
            title: "Encerrar Sessão",
            description: "Tem certeza que deseja encerrar a sessão? Esta ação é irreversível.",
            variant: "destructive",
            type: "confirm",
            onConfirm: async () => {
                startTransition(async () => {
                    const result = await endSession(slug, sessao.id)
                    if (result?.error) showAlert("Erro", result.error)
                    else router.refresh()
                })
            }
        })
    }

    const handleOpenVoting = async () => {
        if (!selectedProjectId) return
        startTransition(async () => {
            const result = await openVoting(slug, sessao.id, selectedProjectId)
            if (result?.error) showAlert("Erro", result.error)
            else {
                if (useTimer) setTimeLeft(timerValue)
                router.refresh()
            }
        })
    }

    const handleCloseVoting = async () => {
        if (!activeVoting) return
        startTransition(async () => {
            const result = await closeVoting(slug, sessao.id, activeVoting.id)
            if (result?.error) showAlert("Erro", result.error)
            else {
                setTimeLeft(null)
                setActiveVoting(null)
                setSelectedProjectId("")
                router.refresh()
            }
        })
    }

    const totalVoted = votes.length
    const allVoted = totalVoted === councilors.length && councilors.length > 0

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Flow Control */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Session Status Card */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-foreground">Controle da Sessão</h3>
                            <div className="flex items-center gap-2">
                                <Badge variant={sessao.status === 'aberta' ? 'default' : 'secondary'} className={cn(
                                    sessao.status === 'aberta' ? "bg-green-500/10 text-green-500 border-green-500/20" : ""
                                )}>
                                    {sessao.status.toUpperCase()}
                                </Badge>
                                {sessao.status === 'aberta' && (
                                    <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Em ANDAMENTO
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {sessao.status === 'agendada' && (
                                <Button onClick={handleStartSession} disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white">
                                    <Play className="w-4 h-4 mr-2" /> Iniciar Sessão
                                </Button>
                            )}
                            {sessao.status === 'aberta' && (
                                <Button onClick={handleEndSession} disabled={isPending} variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                                    <Square className="w-4 h-4 mr-2" /> Finalizar Sessão
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Voting Area */}
                    {sessao.status === 'aberta' && (
                        <div className="border-t border-border pt-6 mt-6">
                            {!activeVoting ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary mb-2">
                                        <Vote className="w-5 h-5" />
                                        <h4 className="font-medium">Iniciar Nova Votação</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Escolher Projeto</label>
                                            <select 
                                                value={selectedProjectId}
                                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                                            >
                                                <option value="">Selecione um projeto da pauta...</option>
                                                {pautaItems.map((item) => (
                                                    <option 
                                                        key={item.projeto.id} 
                                                        value={item.projeto.id}
                                                        disabled={item.projeto.status === 'votado'}
                                                    >
                                                        {item.projeto.numero} - {item.projeto.titulo} {item.projeto.status === 'votado' ? '(Votado)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cronometragem</label>
                                            <div className="flex items-center gap-4 h-[45px]">
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="checkbox" 
                                                        id="useTimer" 
                                                        checked={useTimer}
                                                        onChange={(e) => setUseTimer(e.target.checked)}
                                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                                    />
                                                    <label htmlFor="useTimer" className="text-sm font-medium">Habilitar Tempo</label>
                                                </div>
                                                {useTimer && (
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="number" 
                                                            value={timerValue}
                                                            onChange={(e) => setTimerValue(parseInt(e.target.value))}
                                                            className="w-20 bg-background border border-border rounded-lg px-2 py-1 text-sm text-center"
                                                        />
                                                        <span className="text-xs text-muted-foreground">seg</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={handleOpenVoting} 
                                        disabled={!selectedProjectId || isPending} 
                                        className="w-full md:w-auto bg-primary text-primary-foreground font-semibold px-8 h-11"
                                    >
                                        ABRIR VOTAÇÃO
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                            <div>
                                                <Badge className="mb-2 bg-primary/20 text-primary border-primary/30 uppercase tracking-widest text-[10px] font-bold">Em Votação</Badge>
                                                <h4 className="text-xl font-bold text-foreground">{activeVoting.projetos?.numero} - {activeVoting.projetos?.titulo}</h4>
                                            </div>
                                            {timeLeft !== null && (
                                                <div className={cn(
                                                    "flex items-center gap-3 px-6 py-3 rounded-2xl border-2 font-mono text-2xl font-bold transition-all",
                                                    timeLeft <= 10 ? "bg-red-500/10 border-red-500 text-red-500 animate-pulse" : "bg-card border-primary/30 text-primary"
                                                )}>
                                                    <Timer className="w-6 h-6" />
                                                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2 mb-8">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="text-muted-foreground">Progresso da Votação</span>
                                                <span className="text-primary">{totalVoted} de {councilors.length} Votos</span>
                                            </div>
                                            <Progress value={(totalVoted / councilors.length) * 100} className="h-2 bg-muted transition-all" />
                                            {allVoted && (
                                                <div className="flex items-center gap-2 text-green-500 text-xs font-bold bg-green-500/5 p-2 rounded-lg border border-green-500/20">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Todos os vereadores já votaram!
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <Button 
                                                onClick={handleCloseVoting} 
                                                disabled={isPending} 
                                                className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 h-11 shadow-lg shadow-red-500/20"
                                            >
                                                ENCERRAR VOTAÇÃO E APURAR
                                            </Button>
                                            <Button variant="outline" className="h-11 border-border bg-card">
                                                Interromper
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pauta / Agenda List */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Itens da Pauta</h3>
                    <div className="space-y-2">
                        {pautaItems.map((item) => (
                            <div 
                                key={item.id} 
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-xl border transition-all",
                                    item.projeto.id === selectedProjectId ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/30"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground text-sm border border-border">
                                        {item.ordem}
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-bold text-foreground">{item.projeto.numero}</h5>
                                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">{item.projeto.titulo}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {item.projeto.status === 'votado' ? (
                                        <Badge variant="outline" className="bg-green-500/5 text-green-500 border-green-500/20 px-3 py-1">VOTADO</Badge>
                                    ) : (
                                        <Badge variant="outline" className="px-3 py-1">PENDENTE</Badge>
                                    )}
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Councilors Status */}
            <div className="space-y-6">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground">Presença e Votos</h3>
                        <Badge variant="outline" className="bg-muted text-muted-foreground font-mono">
                            {totalVoted}/{councilors.length}
                        </Badge>
                    </div>

                    <div className="space-y-3">
                        {councilors.map((vereador) => {
                            const voto = votes.find(v => v.vereador_id === vereador.id)
                            const isOnline = !!onlineUsers[vereador.user_id]
                            
                            return (
                                <div key={vereador.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 font-bold text-[10px]">
                                                {vereador.nome.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className={cn(
                                                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#09090b]",
                                                isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"
                                            )} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground line-clamp-1 leading-none mb-1">{vereador.nome}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">{vereador.partido}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {voto ? (
                                            <Badge className={cn(
                                                "w-20 justify-center font-bold text-[10px] tracking-wider",
                                                voto.valor === 'SIM' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                                voto.valor === 'NAO' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                                            )}>
                                                {voto.valor}
                                            </Badge>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold italic px-2">
                                                <Clock className="w-3 h-3" /> AGUARDANDO
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {activeVoting && (
                        <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
                            <h4 className="text-xs font-bold text-primary uppercase tracking-widest text-center">Apuração Parcial</h4>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-center">
                                    <p className="text-lg font-black text-green-500">{votes.filter(v => v.valor === 'SIM').length}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground">SIM</p>
                                </div>
                                <div className="text-center border-x border-primary/10">
                                    <p className="text-lg font-black text-red-500">{votes.filter(v => v.valor === 'NAO').length}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground">NÃO</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-black text-zinc-400">{votes.filter(v => v.valor === 'ABSTENCAO').length}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground">ABS</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                description={confirmConfig.description}
                variant={confirmConfig.variant}
                type={confirmConfig.type}
            />
        </div>
    )
}
