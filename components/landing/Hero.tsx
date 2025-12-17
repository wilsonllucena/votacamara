"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950">
       {/* Ambient Spotlight */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1200px] pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen" />
       </div>

       {/* Grid Pattern Overlay */}
       <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="container mx-auto relative z-10 px-4 md:px-6 flex flex-col items-center text-center">
        
        {/* Premium Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative group mb-8"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-200" />
          <div className="relative inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 py-1.5 text-sm text-slate-300 shadow-2xl">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="font-medium tracking-wide">Nova Versão 2025 Disponível</span>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-8 leading-[1.1]">
            Gestão Legislativa <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-blue-500 to-purple-600 drop-shadow-[0_0_25px_rgba(59,130,246,0.3)]">
               Sem Limites.
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-lg md:text-2xl text-slate-400 max-w-3xl mb-12 leading-relaxed"
        >
          A plataforma definitiva para Câmaras Municipais que buscam excelência.
          <span className="text-slate-200"> Transparência total, votação segura e painéis em tempo real</span> em um único lugar.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 items-center justify-center w-full"
        >
          <Button size="lg" className="h-16 px-10 text-lg rounded-full bg-blue-600 hover:bg-blue-500 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] border border-blue-400/20 group transition-all duration-300 hover:scale-105">
            Começar Agora
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-full border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white hover:border-slate-600 transition-all duration-300">
            Agendar Demo
          </Button>
        </motion.div>
        
      </div>
    </section>
  )
}
