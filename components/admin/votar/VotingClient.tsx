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

interface VotingClientProps {
    vereador: any
    slug: string
    initialActiveVoting: any
    camaraId: string
    initialSessaoStatus?: string
}

export function VotingClient({ vereador, slug, initialActiveVoting, camaraId, initialSessaoStatus }: VotingClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isPending, startTransition] = useTransition()
    const [activeVoting, setActiveVoting] = useState(initialActiveVoting)
    const [sessaoStatus, setSessaoStatus] = useState<string>(initialSessaoStatus || "agendada")
    const [myVote, setMyVote] = useState<string | null>(null)
    const [timeLeft, setTimeLeft] = useState<number | null>(null)

    // 1. Monitor Active Voting Changes and My Vote
    useEffect(() => {
        // Find if I already voted for this voting
        const checkMyVote = async () => {
            if (!activeVoting || !vereador?.id) return
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

        if (!vereador?.camara_id) return

        // Subscribe to changes in votacoes for this chamber/slug
        const votingChannel = supabase
            .channel(`voting-sync-${slug}`)
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'votacoes',
                filter: `camara_id=eq.${vereador?.camara_id || camaraId}`
            }, (payload) => {
                const updated = payload.new as any
                if (updated && updated.status === 'aberta') {
                    supabase.from("votacoes")
                        .select("*, projetos(*)")
                        .eq("id", updated.id)
                        .single()
                        .then(({ data }) => setActiveVoting(data))
                } else {
                    setActiveVoting(null)
                    setMyVote(null)
                    // Se a votação foi encerrada, recarregar para limpar estado
                    router.refresh()
                }
            })
            .subscribe()

        // Subscribe to Session status changes
        const sessaoChannel = supabase
            .channel(`sessao-sync-${slug}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'sessoes',
                filter: `camara_id=eq.${vereador?.camara_id || camaraId}`
            }, (payload) => {
                const updated = payload.new as any
                setSessaoStatus(updated.status)
                if (updated.status === 'encerrada') {
                    setActiveVoting(null)
                    setMyVote(null)
                }
                router.refresh()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(votingChannel)
            supabase.removeChannel(sessaoChannel)
        }
    }, [activeVoting?.id, supabase, vereador?.camara_id, vereador?.id, slug, router])

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

    // Timer Logic (Simulated sync for now, ideal is to have 'expires_at' in DB)
    useEffect(() => {
        if (!activeVoting) return
        // If the management screen sends a "timer_start" event or similar, we could sync better.
        // For now, it's independent or we'd need a field in the DB.
    }, [activeVoting])

    const handleVote = async (valor: 'SIM' | 'NAO' | 'ABSTENCAO') => {
        if (!activeVoting || isPending) return
        
        startTransition(async () => {
            const result = await registrarVoto(activeVoting.id, valor)
            if (result?.error) {
                alert(result.error)
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
            <div className="bg-[#111827] rounded-t-2xl p-6 border-x border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1e293b] flex items-center justify-center text-indigo-400 font-bold text-lg border border-indigo-500/20">
                        {vereador?.nome?.substring(0, 2).toUpperCase() || "AD"}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{vereador?.nome || "Administrador"}</h3>
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{vereador?.partido || "Gestão"} - {vereador ? "Vereador" : "Visualização"}</p>
                    </div>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-4 py-1.5 font-bold tracking-widest text-[10px] uppercase flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Votação Aberta
                </Badge>
            </div>

            {/* Main Voting Section */}
            <div className="bg-[#0f172a] rounded-b-2xl p-8 border-x border-b border-white/5 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* Project Info */}
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <span className="text-indigo-400 font-mono text-sm font-bold tracking-wider">{activeVoting.projetos?.numero || "PL 000/2024"}</span>
                            <h2 className="text-3xl font-black text-white leading-tight">
                                {activeVoting.projetos?.titulo}
                            </h2>
                            <p className="text-zinc-400 text-lg leading-relaxed pt-4">
                                {activeVoting.projetos?.ementa || "Descrição detalhada do projeto de lei sendo votado..."}
                            </p>
                        </div>

                        {/* Optional Timer Logic View */}
                        <div className="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between text-zinc-400 text-sm font-bold uppercase tracking-widest">
                                <span>Tempo Restante para Voto</span>
                                <span className="text-white text-2xl font-mono">--:--</span>
                            </div>
                            <Progress value={0} className="h-2.5 bg-zinc-800" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-zinc-500 text-sm font-bold uppercase tracking-widest text-center mb-2">Selecione sua opção de voto</h4>
                        
                        {/* Vote SIM */}
                        <button 
                            onClick={() => handleVote('SIM')}
                            disabled={isPending || myVote !== null}
                            className={cn(
                                "group relative w-full h-24 rounded-2xl border-2 transition-all flex items-center justify-between px-8",
                                myVote === 'SIM' 
                                    ? "bg-green-500/20 border-green-500 text-green-500" 
                                    : "bg-transparent border-white/5 text-zinc-400 hover:border-green-500/50 hover:bg-green-500/5"
                            )}
                        >
                            <span className="text-2xl font-black italic tracking-tighter">SIM</span>
                            <div className={cn(
                                "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                                myVote === 'SIM' ? "bg-green-500 border-green-500 text-white" : "border-white/10 group-hover:border-green-500/50"
                            )}>
                                {myVote === 'SIM' && <Check className="w-6 h-6 stroke-[3]" />}
                            </div>
                        </button>

                        {/* Vote NAO */}
                        <button 
                            onClick={() => handleVote('NAO')}
                            disabled={isPending || myVote !== null}
                            className={cn(
                                "group relative w-full h-24 rounded-2xl border-2 transition-all flex items-center justify-between px-8",
                                myVote === 'NAO' 
                                    ? "bg-red-500/20 border-red-500 text-red-500" 
                                    : "bg-transparent border-white/5 text-zinc-400 hover:border-red-500/50 hover:bg-red-500/5"
                            )}
                        >
                            <span className="text-2xl font-black italic tracking-tighter">NÃO</span>
                            <div className={cn(
                                "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                                myVote === 'NAO' ? "bg-red-500 border-red-500 text-white" : "border-white/10 group-hover:border-red-500/50"
                            )}>
                                {myVote === 'NAO' && <Check className="w-6 h-6 stroke-[3]" />}
                            </div>
                        </button>

                        {/* Vote ABSTENER */}
                        <Button 
                            variant="ghost" 
                            onClick={() => handleVote('ABSTENCAO')}
                            disabled={isPending || myVote !== null}
                            className={cn(
                                "h-16 rounded-2xl border border-white/5 text-zinc-500 font-bold uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all",
                                myVote === 'ABSTENCAO' ? "bg-white/10 text-white border-white/20" : ""
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
        </div>
    )
}
