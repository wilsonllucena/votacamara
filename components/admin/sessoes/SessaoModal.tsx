"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SessaoForm } from "./SessaoForm"
import { SessaoInputs } from "@/app/admin/_actions/sessoes"

interface Sessao {
    id: string
    titulo: string
    tipo: "ordinaria" | "extraordinaria"
    status: "agendada" | "aberta" | "encerrada"
    data: string
    hora: string
    projeto_ids?: string[]
}

interface SessaoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SessaoInputs) => void
  editingSessao?: Sessao | null
  isPending?: boolean
  availableProjects: any[]
  busyProjects: any[]
}

export function SessaoModal({ isOpen, onClose, onSubmit, editingSessao, isPending, availableProjects, busyProjects }: SessaoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] border-border bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {editingSessao ? "Editar Sessão" : "Nova Sessão"}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <SessaoForm 
            defaultValues={editingSessao || undefined}
            isPending={isPending}
            availableProjects={availableProjects}
            busyProjects={busyProjects}
            onSubmit={(data) => {
              onSubmit(data)
            }}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
