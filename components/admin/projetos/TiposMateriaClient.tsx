"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import { Tag, Info } from "lucide-react"

import { createMongoAbility, RawRuleOf, MongoAbility } from "@casl/ability"
import { Action, Subject } from "@/lib/casl/ability"
import { useMemo } from "react"

interface TipoMateria {
    id: string
    nome: string
    sigla: string
    created_at: string
}

interface TiposMateriaClientProps {
    tipos: TipoMateria[]
    rules?: RawRuleOf<MongoAbility<[Action, Subject]>>[]
}

export function TiposMateriaClient({ tipos, rules = [] }: TiposMateriaClientProps) {
    // Reconstruir abilidade no cliente de forma estável
    const ability = useMemo(() => createMongoAbility<[Action, Subject]>(rules), [rules])
    const can = (action: Action, subject: Subject) => ability.can(action, subject)
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Tipos de Matéria</h1>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Lista de tipos de proposituras legislativas configuradas no sistema.
                </p>
            </div>
            <div className="p-4 border border-dashed border-border rounded-lg bg-muted/20 text-xs text-muted-foreground">
                <p>⚠️ <strong>Nota:</strong> Os tipos de matéria são configurados globalmente pelo administrador do sistema. Esta página é apenas para consulta.</p>
            </div>
            <Card className="border-border bg-card/50 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[100px] font-bold">Sigla</TableHead>
                            <TableHead className="font-bold">Tipo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tipos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                                    Nenhum tipo de matéria cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tipos.map((tipo) => (
                                <TableRow key={tipo.id} className="hover:bg-accent/5 transition-colors group">
                                    <TableCell>
                                        <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-black px-2 shadow-none uppercase">
                                            {tipo.sigla}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-foreground">
                                        {tipo.nome}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
