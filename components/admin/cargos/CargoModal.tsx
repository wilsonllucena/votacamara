"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CargoForm, CargoInputs } from "./CargoForm"

interface CargoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CargoInputs) => void
  editingCargo?: (Partial<CargoInputs> & { id: string }) | null
  isPending?: boolean
}

export function CargoModal({ isOpen, onClose, onSubmit, editingCargo, isPending }: CargoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {editingCargo ? "Editar Cargo" : "Novo Cargo"}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <CargoForm 
            defaultValues={editingCargo || undefined}
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
