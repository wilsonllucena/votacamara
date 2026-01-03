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

interface PublicVotingClientProps {
    camara: any
    activeSession: any
    activeVoting: any
    councilors: any[]
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
        const results = voteData.reduce((acc, vote) => {
            acc[vote.valor as keyof VoteResult] = (acc[vote.valor as keyof VoteResult] || 0) + 1
            return acc
        }, { FAVORAVEL: 0, CONTRA: 0, ABSTENCAO: 0, AUSENTE: 0 })

        setVoteResults(results)
    }

    const totalVotes = voteResults.FAVORAVEL + voteResults.CONTRA + voteResults.ABSTENCAO + voteResults.AUSENTE
    const totalCouncilors = councilors.length
    const participationRate = totalVotes > 0 ? Math.round((totalVotes / totalCouncilors) * 100) : 0

    const getVoteColor = (voteType: keyof VoteResult) => {
        switch (voteType) {
            case 'FAVORAVEL': return 'bg-green-500'
            case 'CONTRA': return 'bg-red-500'
            case 'ABSTENCAO': return 'bg-yellow-500'
            case 'AUSENTE': return 'bg-gray-500'
            default: return 'bg-gray-500'
        }
    }

    const getVoteBgColor = (voteType: keyof VoteResult) => {
        switch (voteType) {
            case 'FAVORAVEL': return 'bg-green-500/10 border-green-500/20 text-green-500'
            case 'CONTRA': return 'bg-red-500/10 border-red-500/20 text-red-500'
            case 'ABSTENCAO': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
            case 'AUSENTE': return 'bg-gray-500/10 border-gray-500/20 text-gray-500'
            default: return 'bg-gray-500/10 border-gray-500/20 text-gray-500'
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
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{camara?.nome}</h1>
                            <p className="text-zinc-400 text-sm">Acompanhamento Público de Votações</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-4 py-1.5 font-bold tracking-widest text-[10px] uppercase flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Votação Aberta
                        </Badge>
                        <div className="text-zinc-400 text-sm flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>Público</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Voting Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Project Info */}
                    <div className="bg-[#111827] rounded-2xl p-8 border border-white/5">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                                    {currentVoting.projetos?.numero || "PL 000/2024"}
                                </Badge>
                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                    Em Votação
                                </Badge>
                            </div>
                            <h2 className="text-3xl font-black text-white leading-tight">
                                {currentVoting.projetos?.titulo || "Projeto em Votação"}
                            </h2>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                {currentVoting.projetos?.ementa || "Descrição detalhada do projeto de lei sendo votado..."}
                            </p>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-[#111827] rounded-2xl p-8 border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <Vote className="w-6 h-6 text-indigo-500" />
                            Resultado Parcial
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {Object.entries(voteResults).map(([type, count]) => (
                                <div key={type} className="text-center">
                                    <div className={cn(
                                        "w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl font-black text-white",
                                        getVoteColor(type as keyof VoteResult)
                                    )}>
                                        {count}
                                    </div>
                                    <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
                                        {type === 'FAVORAVEL' ? 'Favorável' : type === 'CONTRA' ? 'Contra' : type === 'ABSTENCAO' ? 'Abstenção' : 'Ausente'}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Participação</span>
                                <span className="text-white font-medium">{participationRate}%</span>
                            </div>
                            <Progress value={participationRate} className="h-3 bg-zinc-800" />
                            <div className="flex items-center justify-between text-xs text-zinc-500">
                                <span>{totalVotes} de {totalCouncilors} vereadores</span>
                                <span>Votação em tempo real</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Councilors Votes */}
                <div className="lg:col-span-1">
                    <div className="bg-[#111827] rounded-2xl p-6 border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <Users className="w-6 h-6 text-indigo-500" />
                            Votos dos Vereadores
                        </h3>
                        
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {councilors.map((councilor) => {
                                const vote = votes.find(v => v.vereador_id === councilor.id)
                                const voteType = vote?.valor as keyof VoteResult | undefined
                                
                                return (
                                    <div key={councilor.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                                                {councilor.nome?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm">{councilor.nome}</p>
                                                <p className="text-zinc-500 text-xs">{councilor.partido}</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                            voteType ? getVoteBgColor(voteType) : "bg-zinc-800 text-zinc-500"
                                        )}>
                                            {voteType === 'FAVORAVEL' ? 'FAVORÁVEL' : 
                                             voteType === 'CONTRA' ? 'CONTRA' : 
                                             voteType === 'ABSTENCAO' ? 'ABSTENÇÃO' : 
                                             voteType ? voteType : 'Aguardando'}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}