"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
    Users, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    Eye,
    Vote,
    Timer,
    User,
    Building2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePresenceStore } from "@/store/use-presence-store"

interface PublicVotingClientProps {
    camara: any
    activeSession: any
    activeVoting: any
    councilors: any[]
    mesaDiretora: any[]
    slug: string
}

interface VoteResult {
    FAVORAVEL: number
    CONTRA: number
    ABSTENCAO: number
    AUSENTE: number
}

export function PublicVotingClient({ 
    camara, 
    activeSession, 
    activeVoting, 
    councilors, 
    mesaDiretora,
    slug 
}: PublicVotingClientProps) {
    const supabase = createClient()
    const [currentVoting, setCurrentVoting] = useState(activeVoting)
    const [currentSession, setCurrentSession] = useState(activeSession)
    const [votes, setVotes] = useState<any[]>([])
    const [voteResults, setVoteResults] = useState<VoteResult>({
        FAVORAVEL: 0,
        CONTRA: 0,
        ABSTENCAO: 0,
        AUSENTE: 0
    })
    const { onlineUsers, initialize: initPresence, cleanup: cleanupPresence } = usePresenceStore()

    // Initialize Presence
    useEffect(() => {
        if (!camara?.id) return
        // Public view doesn't "track" its own user usually, 
        // but we can use a random or specific ID for the viewer 
        // to just "watch" the presence channel.
        // However, for online status of councilors, we just need to listen.
        initPresence(camara.id, `viewer-${Math.random().toString(36).substring(7)}`)

        return () => {
            cleanupPresence()
        }
    }, [camara?.id])

    // Monitor voting changes in real-time
    useEffect(() => {
        if (!camara?.id) return

        // Subscribe to voting changes
        const votingChannel = supabase
            .channel(`public-voting-${slug}`)
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'votacoes',
                filter: `camara_id=eq.${camara.id}`
            }, (payload) => {
                const updated = payload.new as any
                if (updated && updated.status === 'aberta') {
                    supabase.from("votacoes")
                        .select("*, projetos(*)")
                        .eq("id", updated.id)
                        .single()
                        .then(({ data }) => setCurrentVoting(data))
                } else {
                    setCurrentVoting(null)
                }
            })
            .subscribe()

        // Subscribe to session changes
        const sessionChannel = supabase
            .channel(`public-session-${slug}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'sessoes',
                filter: `camara_id=eq.${camara.id}`
            }, (payload) => {
                const updated = payload.new as any
                setCurrentSession(updated)
                if (updated.status === 'encerrada') {
                    setCurrentVoting(null)
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(votingChannel)
            supabase.removeChannel(sessionChannel)
        }
    }, [camara?.id, slug, supabase])

    // Monitor votes for current voting
    useEffect(() => {
        if (!currentVoting?.id) return

        // Load initial votes
        const loadVotes = async () => {
            const { data } = await supabase
                .from("votos")
                .select("*, vereadores(nome, partido, foto_url)")
                .eq("votacao_id", currentVoting.id)
            
            if (data) {
                setVotes(data)
                calculateResults(data)
            }
        }

        loadVotes()

        // Subscribe to vote changes
        const voteChannel = supabase
            .channel(`public-votes-${currentVoting.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'votos',
                filter: `votacao_id=eq.${currentVoting.id}`
            }, async () => {
                // Reload all votes when any change happens
                const { data } = await supabase
                    .from("votos")
                    .select("*, vereadores(nome, partido, foto_url)")
                    .eq("votacao_id", currentVoting.id)
                
                if (data) {
                    setVotes(data)
                    calculateResults(data)
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(voteChannel)
        }
    }, [currentVoting?.id, supabase])

    const calculateResults = (voteData: any[]) => {
        // Ensure we only count votes from councilors who are allowed to vote
        const votingCouncilorIds = new Set(councilors
            .filter(c => {
                const mesa = mesaDiretora.find(m => m.vereador_id === c.id)
                const cargo = mesa?.cargos?.nome?.toLowerCase() || ""
                return !(cargo.includes('presidente') && !cargo.includes('vice'))
            })
            .map(c => c.id)
        )

        const results = voteData.reduce((acc, vote) => {
            if (votingCouncilorIds.has(vote.vereador_id)) {
                acc[vote.valor as keyof VoteResult] = (acc[vote.valor as keyof VoteResult] || 0) + 1
            }
            return acc
        }, { FAVORAVEL: 0, CONTRA: 0, ABSTENCAO: 0, AUSENTE: 0 })

        setVoteResults(results)
    }

    const president = councilors.find(c => {
        const mesa = mesaDiretora.find(m => m.vereador_id === c.id)
        const cargo = mesa?.cargos?.nome?.toLowerCase() || ""
        return cargo.includes('presidente') && !cargo.includes('vice')
    })

    const votingCouncilors = councilors.filter(c => c.id !== president?.id)

    const totalVotes = voteResults.FAVORAVEL + voteResults.CONTRA + voteResults.ABSTENCAO + voteResults.AUSENTE
    const totalVotersCount = votingCouncilors.length
    const participationRate = totalVotes > 0 ? Math.round((totalVotes / totalVotersCount) * 100) : 0

    // Helper function to get first and second name
    const getShortName = (fullName: string) => {
        const names = fullName.trim().split(' ')
        if (names.length >= 2) {
            return `${names[0]} ${names[1]}`
        }
        return names[0] || fullName
    }

    const getVoteColor = (voteType: keyof VoteResult) => {
        switch (voteType) {
            case 'FAVORAVEL': return 'text-green-500'
            case 'CONTRA': return 'text-red-500'
            case 'ABSTENCAO': return 'text-amber-500'
            case 'AUSENTE': return 'text-zinc-500'
            default: return 'text-zinc-500'
        }
    }

    const getVoteBgColor = (voteType: keyof VoteResult) => {
        switch (voteType) {
            case 'FAVORAVEL': return 'bg-green-500/10 border-green-500/20 text-green-500'
            case 'CONTRA': return 'bg-red-500/10 border-red-500/20 text-red-500'
            case 'ABSTENCAO': return 'bg-amber-500/10 border-amber-500/20 text-amber-500'
            case 'AUSENTE': return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500'
            default: return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500'
        }
    }

    if (!currentSession || currentSession.status === 'encerrada') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-6 p-6">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="space-y-3 max-w-md">
                    <h1 className="text-3xl font-bold text-foreground">
                        {camara?.nome || "Câmara Municipal"}
                    </h1>
                    <h2 className="text-xl font-semibold text-muted-foreground">
                        Sessão Encerrada
                    </h2>
                    <p className="text-muted-foreground">
                        Não há sessão em andamento no momento. Por favor, aguarde a próxima sessão legislativa.
                    </p>
                </div>
            </div>
        )
    }

    if (!currentVoting) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-6 p-6">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <Eye className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="space-y-3 max-w-md">
                    <h1 className="text-3xl font-bold text-foreground">
                        {camara?.nome || "Câmara Municipal"}
                    </h1>
                    <h2 className="text-xl font-semibold text-muted-foreground">
                        Sessão em Andamento
                    </h2>
                    <p className="text-muted-foreground">
                        Acompanhe a sessão legislativa. Aguardando abertura da próxima votação...
                    </p>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-4 py-1.5 font-bold tracking-widest text-[10px] uppercase flex items-center gap-2 mx-auto">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Sessão Aberta
                    </Badge>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-primary selection:text-primary-foreground px-2 sm:px-4 flex items-center justify-center">
            {/* Background pattern/glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-[1600px] bg-[#0f172a] rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col">
                
                {/* Header Section */}
                <div className="p-8 sm:p-12 border-b border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="space-y-6 flex-1">
                            <div className="flex items-center gap-4 flex-wrap">
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 font-black tracking-[0.1em] text-[10px] uppercase flex items-center gap-2 rounded-full shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Votação em Andamento
                                </Badge>
                                <span className="text-zinc-500 font-bold tracking-widest text-xs uppercase">
                                    {currentVoting.projetos?.numero || "PL 000/2024"}
                                </span>
                                {president && (
                                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                        <User className="w-3 h-3 text-primary" />
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                                            PRESIDENTE: <span className="text-zinc-100">{president.nome}</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-5">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-[1.2] text-zinc-100 max-w-4xl">
                                    {currentVoting.projetos?.titulo || "Projeto em Votação"}
                                </h1>
                                <p className="text-zinc-400 text-sm sm:text-base font-medium leading-relaxed max-w-5xl italic opacity-90 border-l-2 border-white/10 pl-4 py-1">
                                    {currentVoting.projetos?.ementa || "Aguardando detalhes da ementa..."}
                                </p>
                            </div>
                        </div>

                        {/* Real-time Counter Header - Right side on desktop, below on mobile */}
                        <div className="flex items-center justify-center gap-4 sm:gap-8 bg-black/20 p-4 sm:p-6 rounded-3xl border border-white/5 shadow-inner w-full md:w-auto">
                            <div className="text-center group">
                                <div className="text-3xl sm:text-4xl font-black text-emerald-500 transition-transform group-hover:scale-110 duration-300">
                                    {voteResults.FAVORAVEL}
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] text-zinc-500 uppercase mt-1">Favorável</div>
                            </div>
                            <div className="text-center group">
                                <div className="text-3xl sm:text-4xl font-black text-red-500 transition-transform group-hover:scale-110 duration-300">
                                    {voteResults.CONTRA}
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] text-zinc-500 uppercase mt-1">Contra</div>
                            </div>
                            <div className="text-center group">
                                <div className="text-3xl sm:text-4xl font-black text-amber-500 transition-transform group-hover:scale-110 duration-300">
                                    {voteResults.ABSTENCAO}
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] text-zinc-500 uppercase mt-1">Abst</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                <div className="flex-1 p-8 sm:p-12 bg-black/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {votingCouncilors.map((councilor) => {
                            const vote = votes.find(v => v.vereador_id === councilor.id)
                            const voteType = vote?.valor as keyof VoteResult | undefined
                            const hasVoted = !!voteType
                            const isOnline = !!onlineUsers[councilor.user_id]
                            
                            return (
                                <div 
                                    key={councilor.id} 
                                    className={cn(
                                        "group relative flex items-center justify-between p-5 rounded-2xl transition-all duration-300 border border-white/5",
                                        hasVoted ? "bg-white/[0.03] border-white/10" : "bg-black/20 border-white/[0.02]"
                                    )}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="relative flex-shrink-0">
                                            {councilor.foto_url ? (
                                                <img 
                                                    src={councilor.foto_url} 
                                                    alt={councilor.nome} 
                                                    className={cn(
                                                        "w-12 h-12 rounded-full object-cover aspect-square border-2 transition-colors",
                                                        isOnline ? "border-emerald-500/50" : "border-white/10 grayscale-[0.5]"
                                                    )}
                                                />
                                            ) : (
                                                <div className={cn(
                                                    "w-12 h-12 rounded-full aspect-square flex items-center justify-center text-zinc-400 font-black text-sm border-2",
                                                    isOnline ? "bg-emerald-500/5 border-emerald-500/20" : "bg-zinc-800 border-white/5"
                                                )}>
                                                    {councilor.nome?.substring(0, 1).toUpperCase()}
                                                </div>
                                            )}
                                            
                                            {/* Presence Indicator */}
                                            <div className={cn(
                                                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0f172a] shadow-lg",
                                                isOnline ? "bg-emerald-500 shadow-emerald-500/20" : "bg-red-500 shadow-red-500/20"
                                            )} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-zinc-100 text-xs truncate leading-tight transition-colors">
                                                {getShortName(councilor.nome)}
                                            </p>
                                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-0.5">
                                                {councilor.partido}
                                            </p>
                                        </div>
                                    </div>

                                    {hasVoted ? (
                                        <div className={cn(
                                            "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider shadow-lg border",
                                            getVoteBgColor(voteType as keyof VoteResult)
                                        )}>
                                            {voteType === 'FAVORAVEL' ? 'Favorável' : 
                                             voteType === 'CONTRA' ? 'Contra' : 
                                             voteType === 'ABSTENCAO' ? 'Abst' : voteType}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-600 uppercase tracking-widest italic pr-2">
                                            <Clock className="w-3 h-3" />
                                            ...
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Footer Status Bar */}
                <div className="p-6 sm:p-8 bg-black/30 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-zinc-800 rounded-xl">
                                <Timer className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tempo de Votação</p>
                                <p className="text-sm font-bold text-zinc-300">04:32</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-white/5 hidden sm:block" />
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-zinc-800 rounded-xl">
                                <Users className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Quórum</p>
                                <p className="text-sm font-bold text-zinc-300">{totalVotes}/{totalVotersCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Câmara Municipal de</p>
                            <p className="text-sm font-bold text-zinc-300">{camara?.nome}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2">
                             <img src="/logo.png" alt="Logo" className="w-full h-full object-contain opacity-50" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}