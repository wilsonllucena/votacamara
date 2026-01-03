"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface GenerateAtasDialogProps {
  isOpen: boolean
  onClose: () => void
  onGenerated: (ata: any) => void
}

export function GenerateAtasDialog({ isOpen, onClose, onGenerated }: GenerateAtasDialogProps) {
  const [step, setStep] = useState<"list" | "loading" | "success">("list")
  const [selectedSessao, setSelectedSessao] = useState<string | null>(null)

  // Mock sessions without minutes
  const pendingSessions = [
    { id: "2", nome: "Sessão Ordinária 02/2024", data: "2024-01-17" },
    { id: "3", nome: "Sessão Extraordinária 03/2024", data: "2024-01-20" },
  ]

  const handleGenerate = () => {
    if (!selectedSessao) return
    
    setStep("loading")
    
    // Simulate generation process
    setTimeout(() => {
      setStep("success")
      const sessao = pendingSessions.find(s => s.id === selectedSessao)
      onGenerated({ 
        id: selectedSessao, 
        sessao_nome: sessao?.nome,
        data: sessao?.data 
      })
    }, 2000)
  }

  const resetAndClose = () => {
    onClose()
    setTimeout(() => {
      setStep("list")
      setSelectedSessao(null)
    }, 300)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] border-border bg-card p-4 sm:p-6 overflow-hidden">
        {step === "list" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Gerar Ata de Sessão
              </DialogTitle>
              <DialogDescription>
                Selecione uma sessão plenária que ainda não possui ata oficial para iniciar o processo de geração automática.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-4">
              <div className="grid gap-2">
                {pendingSessions.map((sessao) => (
                  <button
                    key={sessao.id}
                    onClick={() => setSelectedSessao(sessao.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left group ${
                      selectedSessao === sessao.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-accent/30 hover:bg-accent/50 hover:border-accent"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className={`font-bold text-sm ${selectedSessao === sessao.id ? "text-primary" : "text-foreground"}`}>
                        {sessao.nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Realizada em {new Date(sessao.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedSessao === sessao.id
                        ? "border-primary bg-primary text-white"
                        : "border-muted-foreground group-hover:border-foreground"
                    }`}>
                      {selectedSessao === sessao.id && <div className="w-2 h-2 rounded-full bg-white animate-in zoom-in duration-300" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                  A geração automática utiliza os registros de pauta, votações e presenças da sessão. Certifique-se de que a sessão foi finalizada corretamente.
                </p>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-6 border-t border-border/50 pt-4">
              <Button variant="ghost" onClick={resetAndClose} className="font-bold w-full sm:w-auto">Cancelar</Button>
              <Button 
                onClick={handleGenerate} 
                disabled={!selectedSessao} 
                className="bg-primary hover:bg-primary/90 font-bold px-8 w-full sm:w-auto"
              >
                Gerar Ata Oficial
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "loading" && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-pulse" />
              <Loader2 className="w-16 h-16 text-primary animate-spin absolute top-0" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Gerando Documento...</h2>
              <p className="text-sm text-muted-foreground max-w-[300px]">
                Estamos processando os dados da sessão e formatando a ata oficial em PDF.
              </p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground">Ata Gerada!</h2>
              <p className="text-sm text-muted-foreground max-w-[320px]">
                O documento foi gerado com sucesso e já está disponível para visualização e download na listagem.
              </p>
            </div>
            <Button onClick={resetAndClose} className="bg-primary hover:bg-primary/90 font-bold px-12">
              Voltar para Listagem
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
