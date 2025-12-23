"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CouncilorForm, CouncilorInputs } from "./CouncilorForm"

interface CouncilorModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CouncilorInputs) => void
  editingCouncilor?: Partial<CouncilorInputs> | null
  isPending?: boolean
}

export function CouncilorModal({ isOpen, onClose, onSubmit, editingCouncilor, isPending }: CouncilorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {editingCouncilor ? "Editar Vereador" : "Novo Vereador"}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <CouncilorForm 
            defaultValues={editingCouncilor || undefined}
            isPending={isPending}
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
