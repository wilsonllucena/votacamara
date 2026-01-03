"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
    Vote, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    User,
    Timer,
    Check
} from "lucide-react"
import { registrarVoto } from "@/app/admin/_actions/sessao_control"
import { cn } from "@/lib/utils"

import { useSessionStore } from "@/store/use-session-store"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface VotingClientProps {
    vereador: any
    slug: string
    initialActiveVoting: any
    camaraId: string
    initialSessaoStatus?: string
    sessaoId: string
}

export function VotingClient({ vereador, slug, initialActiveVoting, camaraId, initialSessaoStatus, sessaoId }: VotingClientProps) {
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

    // Zustand Store
    const { 
        activeVoting, 
        sessaoStatus, 
        initialize: initSession, 
        cleanup: cleanupSession 
    } = useSessionStore()

    const [myVote, setMyVote] = useState<string | null>(null)
    const [timeLeft, setTimeLeft] = useState<number | null>(null)

    // 1. Initialize Global Session Store
    useEffect(() => {
        initSession(sessaoId, camaraId, {
            activeVoting: initialActiveVoting,
            sessaoStatus: initialSessaoStatus || "agendada"
        }, () => router.refresh())

        return () => {
            cleanupSession()
        }
    }, [camaraId, sessaoId, initialActiveVoting, initialSessaoStatus]) // Removed initSession and cleanupSession to avoid loops if they change

    // 2. Monitor My Vote for Current Active Voting
    useEffect(() => {
        const checkMyVote = async () => {
            if (!activeVoting || !vereador?.id) {
                setMyVote(null)
                return
            }
            const { data } = await supabase
                .from("votos")
                .select("valor")
                .eq("votacao_id", activeVoting.id)
                .eq("vereador_id", vereador.id)
                .maybeSingle()
            
            if (data) setMyVote(data.valor)
            else setMyVote(null)
        }
        checkMyVote()
    }, [activeVoting?.id, vereador?.id, supabase])

    // 2. Track Presence
    useEffect(() => {
        if (!vereador?.user_id || !camaraId) return

        const presenceChannel = supabase.channel(`presence-${camaraId}`, {
            config: {
                presence: {
                    key: vereador.user_id,
                },
            },
        })

        presenceChannel
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await presenceChannel.track({
                        online_at: new Date().toISOString(),
                    })
                }
            })

        return () => {
            supabase.removeChannel(presenceChannel)
        }
    }, [supabase, vereador?.user_id, camaraId])

    // Timer Logic
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

    const formatTime = (seconds: number | null) => {
        if (seconds === null) return "--:--"
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getProgress = () => {
        if (!activeVoting?.expira_em || !activeVoting?.abriu_em || timeLeft === null) return 0
        const total = (new Date(activeVoting.expira_em).getTime() - new Date(activeVoting.abriu_em).getTime()) / 1000
        if (total <= 0) return 100
        return (timeLeft / total) * 100
    }

    const handleVote = async (valor: 'FAVORAVEL' | 'CONTRA' | 'ABSTENCAO') => {
        if (!activeVoting || isPending) return
        
        startTransition(async () => {
            const result = await registrarVoto(activeVoting.id, valor)
            if (result?.error) {
                showAlert("Erro ao votar", result.error)
            } else {
                setMyVote(valor)
            }
        })
    }

    if (!activeVoting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-foreground">
                        {sessaoStatus === 'encerrada' ? "Sessão Encerrada" : "Aguardando Votação"}
                    </h2>
                    <p className="text-muted-foreground max-w-sm">
                        {sessaoStatus === 'encerrada' 
                            ? "Esta sessão legislativa já foi finalizada. Obrigado pela participação." 
                            : "Não existe projeto a ser votado no momento. Por favor, aguarde o presidente abrir a ordem do dia."}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header / User Info */}
            <div className="bg-muted/50 rounded-t-2xl p-6 border-x border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                        {vereador?.nome?.substring(0, 2).toUpperCase() || "AD"}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">{vereador?.nome || "Administrador"}</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{vereador?.partido || "Gestão"} - {vereador ? "Vereador" : "Visualização"}</p>
                    </div>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-4 py-1.5 font-bold tracking-widest text-[10px] uppercase flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Votação Aberta
                </Badge>
            </div>

            {/* Main Voting Section */}
            <div className="bg-card rounded-b-2xl p-8 border-x border-b border-border shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* Project Info */}
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <span className="text-primary font-mono text-sm font-bold tracking-wider">{activeVoting.projetos?.numero || "PL 000/2024"}</span>
                            <h2 className="text-3xl font-black text-foreground leading-tight">
                                {activeVoting.projetos?.titulo}
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed pt-4">
                                {activeVoting.projetos?.ementa || "Descrição detalhada do projeto de lei sendo votado..."}
                            </p>
                        </div>
 
                        {/* Timer View */}
                        <div className="bg-muted/30 border border-border rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between text-muted-foreground text-sm font-bold uppercase tracking-widest">
                                <span>Tempo Restante para Voto</span>
                                <span className={cn(
                                    "text-2xl font-mono",
                                    timeLeft !== null && timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-foreground"
                                )}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                            <Progress value={getProgress()} className="h-2.5 bg-muted" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-muted-foreground text-sm font-bold uppercase tracking-widest text-center mb-2">Selecione sua opção de voto</h4>
                        
                        {/* Vote FAVORAVEL */}
                        <button 
                            onClick={() => handleVote('FAVORAVEL')}
                            disabled={isPending || myVote !== null}
                            className={cn(
                                "group relative w-full h-24 rounded-2xl border-2 transition-all flex items-center justify-between px-8",
                                myVote === 'FAVORAVEL' 
                                    ? "bg-green-500/10 border-green-500 text-green-500 shadow-lg shadow-green-500/10" 
                                    : "bg-transparent border-border text-muted-foreground hover:border-green-500/50 hover:bg-green-500/5 hover:text-green-500"
                            )}
                        >
                            <span className="text-2xl font-black italic tracking-tighter uppercase">FAVORÁVEL</span>
                            <div className={cn(
                                "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                                myVote === 'FAVORAVEL' ? "bg-green-500 border-green-500 text-white" : "border-border group-hover:border-green-500/50"
                            )}>
                                {myVote === 'FAVORAVEL' && <Check className="w-6 h-6 stroke-[3]" />}
                            </div>
                        </button>
 
                        {/* Vote CONTRA */}
                        <button 
                            onClick={() => handleVote('CONTRA')}
                            disabled={isPending || myVote !== null}
                            className={cn(
                                "group relative w-full h-24 rounded-2xl border-2 transition-all flex items-center justify-between px-8",
                                myVote === 'CONTRA' 
                                    ? "bg-red-500/10 border-red-500 text-red-500 shadow-lg shadow-red-500/10" 
                                    : "bg-transparent border-border text-muted-foreground hover:border-red-500/50 hover:bg-red-500/5 hover:text-red-500"
                            )}
                        >
                            <span className="text-2xl font-black italic tracking-tighter uppercase">CONTRA</span>
                            <div className={cn(
                                "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                                myVote === 'CONTRA' ? "bg-red-500 border-red-500 text-white" : "border-border group-hover:border-red-500/50"
                            )}>
                                {myVote === 'CONTRA' && <Check className="w-6 h-6 stroke-[3]" />}
                            </div>
                        </button>
 
                        {/* Vote ABSTENER */}
                        <Button 
                            variant="ghost" 
                            onClick={() => handleVote('ABSTENCAO')}
                            disabled={isPending || myVote !== null}
                            className={cn(
                                "h-16 rounded-2xl border border-border text-muted-foreground font-bold uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-all",
                                myVote === 'ABSTENCAO' ? "bg-accent text-accent-foreground border-primary/20" : ""
                            )}
                        >
                            {myVote === 'ABSTENCAO' ? "Voto: Abstenção" : "Abster-se da Votação"}
                        </Button>

                        {myVote && (
                            <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-500 text-sm font-medium">
                                <CheckCircle2 className="w-5 h-5" />
                                Seu voto foi registrado com sucesso!
                            </div>
                        )}
                    </div>

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
