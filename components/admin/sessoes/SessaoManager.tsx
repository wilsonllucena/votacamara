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
    closeVoting,
    interruptVoting
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
    mesaDiretora: any[]
    slug: string
}

export function SessaoManager({ 
    sessao, 
    councilors, 
    pautaItems, 
    activeVoting: initialActiveVoting, 
    mesaDiretora,
    slug 
}: SessaoManagerProps) {
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
            sessao: sessao,
            votes: [], 
            activeVoting: initialActiveVoting,
            sessaoStatus: sessao.status
        }, () => router.refresh())

        return () => {
            cleanupSession()
        }
    }, [sessao.id, sessao.camara_id, initialActiveVoting, sessao.status]) 

    // Sync Local State with Prop Changes (for activeVoting specifically if revalidated)
    useEffect(() => {
        if (initialActiveVoting) {
            setActiveVoting(initialActiveVoting)
        }
    }, [initialActiveVoting, setActiveVoting])
    
    // 2. Timer Logic (Synchronized with server)
    useEffect(() => {
        if (!activeVoting || !activeVoting.expira_em) {
            setTimeLeft(null)
            return
        }

        const calculateTimeLeft = () => {
            const expiry = new Date(activeVoting.expira_em).getTime()
            const now = new Date().getTime()
            const difference = Math.floor((expiry - now) / 1000)
            return difference > 0 ? difference : 0
        }

        setTimeLeft(calculateTimeLeft())

        const timer = setInterval(() => {
            const next = calculateTimeLeft()
            setTimeLeft(next)
            if (next <= 0) clearInterval(timer)
        }, 1000)

        return () => clearInterval(timer)
    }, [activeVoting?.expira_em, activeVoting?.id])

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
            const result = await openVoting(
                slug, 
                sessao.id, 
                selectedProjectId, 
                useTimer ? timerValue : undefined
            )
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

    const handleInterruptVoting = async () => {
        if (!activeVoting) return
        startTransition(async () => {
            const result = await interruptVoting(slug, sessao.id, activeVoting.id)
            if (result?.error) showAlert("Erro", result.error)
            else {
                setTimeLeft(null)
                setActiveVoting(null)
                setSelectedProjectId("")
                router.refresh()
            }
        })
    }

    // Sort councilors to put Mesa Diretora first in specific order
    const sortedCouncilors = [...councilors].sort((a, b) => {
        const aMesa = mesaDiretora.find(m => m.vereador_id === a.id)
        const bMesa = mesaDiretora.find(m => m.vereador_id === b.id)
        
        const getPriority = (mesaMember: any) => {
            if (!mesaMember) return 99
            const nome = mesaMember.cargos?.nome?.toLowerCase() || ""
            if (nome.includes('presidente') && !nome.includes('vice')) return 1
            if (nome.includes('vice-presidente')) return 2
            if (nome.includes('1') || nome.includes('primeiro')) return 3
            if (nome.includes('2') || nome.includes('segundo')) return 4
            return 5
        }

        const aPriority = getPriority(aMesa)
        const bPriority = getPriority(bMesa)

        if (aPriority !== bPriority) {
            return aPriority - bPriority
        }
        
        // Secondary sort by name
        return a.nome.localeCompare(b.nome)
    })

    const totalVoters = sortedCouncilors.filter(v => {
        const mesa = mesaDiretora.find(m => m.vereador_id === v.id)
        const cargo = mesa?.cargos?.nome?.toLowerCase() || ""
        const isPresidente = cargo.includes('presidente') && !cargo.includes('vice')
        return !isPresidente
    }).length

    const totalVoted = votes.length
    const allVoted = totalVoted === totalVoters && totalVoters > 0

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
                                <Badge variant={sessaoStatus === 'aberta' ? 'default' : 'secondary'} className={cn(
                                    sessaoStatus === 'aberta' ? "bg-green-500/10 text-green-500 border-green-500/20" : ""
                                )}>
                                    {sessaoStatus.toUpperCase()}
                                </Badge>
                                {sessaoStatus === 'aberta' && (
                                    <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Em ANDAMENTO
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {sessaoStatus === 'agendada' && (
                                <Button onClick={handleStartSession} disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white">
                                    <Play className="w-4 h-4 mr-2" /> Iniciar Sessão
                                </Button>
                            )}
                            {sessaoStatus === 'aberta' && (
                                <Button onClick={handleEndSession} disabled={isPending} variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                                    <Square className="w-4 h-4 mr-2" /> Finalizar Sessão
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Voting Area */}
                    {sessaoStatus === 'aberta' && (
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
                                                {pautaItems
                                                    .filter(item => item.projeto.status !== 'votado')
                                                    .map((item) => (
                                                        <option 
                                                            key={item.projeto.id} 
                                                            value={item.projeto.id}
                                                        >
                                                            {item.projeto.numero} - {item.projeto.titulo}
                                                        </option>
                                                    ))
                                                }
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
                                                <span className="text-primary">{totalVoted} de {totalVoters} Votos</span>
                                            </div>
                                            <Progress value={(totalVoted / totalVoters) * 100} className="h-2 bg-muted transition-all" />
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
                                            <Button 
                                                variant="outline" 
                                                className="h-11 border-border bg-card"
                                                onClick={handleInterruptVoting}
                                                disabled={isPending}
                                            >
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
                        {pautaItems.map((item) => {
                            const isCurrentlyVoting = activeVoting?.projeto_id === item.projeto_id
                            
                            return (
                                <div 
                                    key={item.id} 
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border transition-all",
                                        isCurrentlyVoting 
                                            ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500 shadow-md" 
                                            : item.projeto.id === selectedProjectId 
                                                ? "border-primary bg-primary/5 ring-1 ring-primary" 
                                                : "border-border hover:bg-muted/30"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border",
                                            isCurrentlyVoting ? "bg-blue-500 text-white border-blue-600" : "bg-muted text-muted-foreground border-border"
                                        )}>
                                            {item.ordem}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h5 className="text-sm font-bold text-foreground">{item.projeto.numero}</h5>
                                                {isCurrentlyVoting && (
                                                    <Badge className="bg-blue-500 animate-pulse text-[9px] h-4 px-1">VOTANDO</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">{item.projeto.titulo}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {item.projeto.status === 'votado' ? (
                                            <Badge variant="outline" className="bg-green-500/5 text-green-500 border-green-500/20 px-3 py-1">VOTADO</Badge>
                                        ) : isCurrentlyVoting ? (
                                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1 font-bold">EM VOTAÇÃO</Badge>
                                        ) : (
                                            <Badge variant="outline" className="px-3 py-1">PENDENTE</Badge>
                                        )}
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Right Column: Councilors Status */}
            <div className="space-y-6">
                <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm sticky top-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground">Presença e Votos</h3>
                        <Badge variant="outline" className="bg-muted text-muted-foreground font-mono text-[10px] sm:text-xs">
                        {totalVoted}/{totalVoters}
                    </Badge>
                </div>

                <div className="space-y-3">
                    {sortedCouncilors.map((vereador) => {
                        const voto = votes.find(v => v.vereador_id === vereador.id)
                        const isOnline = !!onlineUsers[vereador.user_id]
                        const mesaMember = mesaDiretora.find(m => m.vereador_id === vereador.id)
                        
                        return (
                            <div key={vereador.id} className={cn(
                                "flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition-colors gap-2 min-w-0",
                                mesaMember ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-muted/30 border-border hover:bg-muted/50"
                            )}>
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                    <div className="relative">
                                        <div className={cn(
                                            "w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex flex-shrink-0 items-center justify-center font-bold text-[10px]",
                                            mesaMember ? "bg-primary/10 border-primary/30 text-primary" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
                                        )}>
                                            {vereador.nome.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className={cn(
                                            "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-background",
                                            isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"
                                        )} />
                                    </div>
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <p className="text-xs sm:text-sm font-bold text-foreground line-clamp-1 leading-none mb-1">
                                            {vereador.nome}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                                            {mesaMember && (
                                                <span className="text-primary font-black mr-1">{mesaMember.cargos?.nome} —</span>
                                            )}
                                            {vereador.partido}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                        {voto ? (
                                            <Badge className={cn(
                                                "w-20 justify-center font-bold text-[10px] tracking-wider",
                                                voto.valor === 'FAVORAVEL' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                                voto.valor === 'CONTRA' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                voto.valor === 'ABSTENCAO' ? 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' :
                                                'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                                            )}>
                                                {voto.valor === 'FAVORAVEL' ? 'FAVORÁVEL' : 
                                                 voto.valor === 'CONTRA' ? 'CONTRA' : 
                                                 voto.valor === 'ABSTENCAO' ? 'ABSTENÇÃO' : 
                                                 voto.valor}
                                            </Badge>
                                        ) : mesaMember?.cargos?.nome?.toLowerCase().includes('presidente') && !mesaMember?.cargos?.nome?.toLowerCase().includes('vice') ? (
                                            <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] text-primary/50 font-bold italic px-1 sm:px-2 whitespace-nowrap">
                                                <span className="">PRESIDE</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] text-muted-foreground font-bold italic px-1 sm:px-2 whitespace-nowrap">
                                                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> 
                                                <span className="hidden xs:inline">AGUARDANDO</span>
                                                <span className="xs:hidden">AGUARD.</span>
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
                                    <p className="text-lg font-black text-green-500">{votes.filter(v => v.valor === 'FAVORAVEL').length}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">FAVORÁVEL</p>
                                </div>
                                <div className="text-center border-x border-primary/10">
                                    <p className="text-lg font-black text-red-500">{votes.filter(v => v.valor === 'CONTRA').length}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">CONTRA</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-black text-zinc-400">{votes.filter(v => v.valor === 'ABSTENCAO').length}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">ABSTENÇÃO</p>
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
