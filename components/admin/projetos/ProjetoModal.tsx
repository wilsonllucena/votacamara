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
  editingProjeto?: (ProjetoInputs & { id: string }) | null
  isPending?: boolean
  vereadores: { id: string, nome: string }[]
}

export function ProjetoModal({ isOpen, onClose, onSubmit, editingProjeto, isPending, vereadores }: ProjetoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {editingProjeto ? "Editar Projeto" : "Novo Projeto"}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ProjetoForm 
            defaultValues={editingProjeto || undefined}
            isPending={isPending}
            vereadores={vereadores}
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
