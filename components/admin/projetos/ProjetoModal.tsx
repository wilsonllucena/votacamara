"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProjetoForm, ProjetoInputs } from "./ProjetoForm"

interface ProjetoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProjetoInputs) => void
  editingProjeto?: ProjetoInputs & { id: string } | null
  isPending?: boolean
}

export function ProjetoModal({
  isOpen,
  onClose,
  onSubmit,
  editingProjeto,
  isPending,
}: ProjetoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {editingProjeto ? "Editar Projeto" : "Novo Projeto"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ProjetoForm 
            defaultValues={editingProjeto || undefined}
            onSubmit={onSubmit}
            onCancel={onClose}
            isPending={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
