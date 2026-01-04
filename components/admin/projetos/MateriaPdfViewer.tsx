"use client"

import { Worker, Viewer, LoadError } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import { FileText, AlertCircle } from "lucide-react"

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

interface MateriaPdfViewerProps {
    fileUrl: string
}

export default function MateriaPdfViewer({ fileUrl }: MateriaPdfViewerProps) {
    const defaultLayoutPluginInstance = defaultLayoutPlugin()

    if (!fileUrl) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 space-y-4 bg-zinc-900/50">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                <FileText className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium">Nenhum anexo disponível.</p>
            </div>
        )
    }

    return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div className="h-full custom-pdf-viewer">
                <Viewer
                    fileUrl={fileUrl}
                    plugins={[defaultLayoutPluginInstance]}
                    theme="dark"
                    renderError={(error: LoadError) => (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 space-y-4 bg-zinc-900">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                          <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <div className="text-center px-6">
                          <p className="text-sm font-bold text-zinc-200">Não foi possível carregar o documento</p>
                          {/* <p className="text-xs text-zinc-500 mt-2 max-w-[280px] leading-relaxed">
                            O arquivo pode ter sido removido ou o link está quebrado (Erro {error.name}).
                          </p> */}
                        </div>
                      </div>
                    )}
                />
            </div>
        </Worker>
    )
}
