"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MesaDiretoraForm, MesaMemberInputs } from "./MesaDiretoraForm"

interface MesaDiretoraModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MesaMemberInputs) => void
  editingMember?: (Partial<MesaMemberInputs> & { id: string }) | null
  cargos: any[]
  vereadores: any[]
  isPending?: boolean
}

export function MesaDiretoraModal({ isOpen, onClose, onSubmit, editingMember, cargos, vereadores, isPending }: MesaDiretoraModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {editingMember ? "Editar Membro da Mesa" : "Adicionar Membro à Mesa"}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <MesaDiretoraForm 
            defaultValues={editingMember || undefined}
            cargos={cargos}
            vereadores={vereadores}
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
