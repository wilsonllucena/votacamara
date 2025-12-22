"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SessaoForm } from "./SessaoForm"
import { SessaoInputs } from "@/app/admin/_actions/sessoes"

interface SessaoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SessaoInputs) => void
  availableProjects?: { id: string; titulo: string; numero: string }[]
  busyProjects?: { projeto_id: string; sessao_id: string }[]
  editingSessao?: (SessaoInputs & { id: string }) | null
  isPending?: boolean
}

export function SessaoModal({ isOpen, onClose, onSubmit, availableProjects = [], busyProjects = [], editingSessao, isPending }: SessaoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-zinc-800 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            {editingSessao ? "Editar Sessão" : "Nova Sessão"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <SessaoForm 
            defaultValues={editingSessao || undefined}
            availableProjects={availableProjects}
            busyProjects={busyProjects}
            onSubmit={onSubmit}
            onCancel={onClose}
            isPending={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
