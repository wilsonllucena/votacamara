"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"

export function ProductShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  // Transform for the main image (notebook)
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [15, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])

  return (
    <section id="features" ref={containerRef} className="py-24 bg-[#0B1121] perspective-1000 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 text-white"
          >
            Gestão completa em <span className="text-blue-500">uma única tela</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400"
          >
            Visual profissional, dados claros e decisões rápidas. Acompanhe cada etapa do processo legislativo com nossa interface intuitiva.
          </motion.p>
        </div>

        <div className="relative flex flex-col items-center justify-center perspective-[1000px]">
          <motion.div
            style={{ 
              rotateX,
              scale,
              opacity,
              transformStyle: "preserve-3d",
            }}
            className="relative z-10 rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm"
          >
             {/* Using a placeholder div for now, in a real scenario this would be an Image */}
             {/* I will use a generated gradient div to simulate a dashboard for now */}
            {/* Realistic Dashboard Mockup */}
            <div className="w-full max-w-5xl bg-slate-950 p-1 rounded-xl ring-1 ring-white/10 relative overflow-hidden font-sans">
                <div className="flex h-full w-full bg-slate-950 rounded-lg overflow-hidden flex-col">
                    
                    {/* Voting Header */}
                    <div className="bg-slate-900 border-b border-slate-800 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="w-full md:w-auto">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider border border-green-500/30 animate-pulse">
                                    Votação em Andamento
                                </span>
                                <span className="text-slate-400 text-sm">PL 123/2024</span>
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-white leading-tight">Projeto de Lei Complementar - Segurança Pública</h3>
                        </div>
                        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-center">
                                <span className="block text-xl md:text-2xl font-bold text-green-500">12</span>
                                <span className="text-xs text-slate-500 font-bold uppercase">Sim</span>
                            </div>
                             <div className="text-center">
                                <span className="block text-xl md:text-2xl font-bold text-red-500">4</span>
                                <span className="text-xs text-slate-500 font-bold uppercase">Não</span>
                            </div>
                             <div className="text-center">
                                <span className="block text-xl md:text-2xl font-bold text-yellow-500">1</span>
                                <span className="text-xs text-slate-500 font-bold uppercase">Abst</span>
                            </div>
                        </div>
                    </div>

                    {/* Voting Grid */}
                    <div className="p-4 md:p-6 bg-slate-950">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                            {[
                                { name: "Carlos Silva", party: "PSD", vote: "sim", photo: "bg-slate-700" },
                                { name: "Ana Pereira", party: "MDB", vote: "sim", photo: "bg-slate-600" },
                                { name: "Roberto Santos", party: "PL", vote: "nao", photo: "bg-slate-700" },
                                { name: "Julia Oliveira", party: "PT", vote: "sim", photo: "bg-slate-600" },
                                { name: "Marcos Lima", party: "PP", vote: "sim", photo: "bg-slate-700" },
                                { name: "Fernanda Costa", party: "PSDB", vote: "abstencao", photo: "bg-slate-600" },
                                { name: "Paulo Souza", party: "UNIÃO", vote: "sim", photo: "bg-slate-700" },
                                { name: "Beatriz Nogueira", party: "PSOL", vote: "nao", photo: "bg-slate-600" },
                                { name: "Ricardo Almeida", party: "REPUBLICANOS", vote: "sim", photo: "bg-slate-700" },
                                { name: "Carla Mendes", party: "PDT", vote: "sim", photo: "bg-slate-600" }, 
                                { name: "Eduardo Rocha", party: "PSB", vote: "sim", photo: "bg-slate-700" },
                                { name: "Vanessa Martins", party: "PSD", vote: "nao", photo: "bg-slate-600" },
                            ].map((councilor, i) => (
                                <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-lg p-2 md:p-3 flex items-center gap-2 md:gap-3 hover:bg-slate-900/60 transition-colors">
                                    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full ${councilor.photo} border-2 border-slate-800 flex-shrink-0 flex items-center justify-center text-[10px] md:text-xs text-slate-400 font-bold`}>
                                        {councilor.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs md:text-sm font-semibold text-slate-200 truncate">{councilor.name}</h4>
                                        <p className="text-[10px] md:text-xs text-slate-500">{councilor.party}</p>
                                    </div>
                                    <div className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[8px] md:text-[10px] font-bold uppercase tracking-wider min-w-[40px] md:min-w-[50px] text-center
                                        ${councilor.vote === 'sim' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                                          councilor.vote === 'nao' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                                          'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}
                                    `}>
                                        {councilor.vote === 'sim' ? 'Sim' : councilor.vote === 'nao' ? 'Não' : 'Abst'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Bottom Bar */}
                    <div className="h-10 md:h-12 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-4 md:px-6 text-[10px] md:text-xs text-slate-500">
                         <span>Tempo de Votação: 04:32</span>
                         <span>Quórum: 12/15</span>
                    </div>
                </div>
            </div>
            
          </motion.div>

            {/* Councilor Tablet Mockup (Below) */}
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="mt-8 md:mt-12 relative w-full max-w-5xl bg-slate-950 rounded-xl ring-1 ring-white/10 shadow-2xl overflow-hidden flex flex-col z-20 mx-auto"
            >
                {/* Tablet Header */}
                <div className="bg-slate-900/80 backdrop-blur border-b border-slate-800 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                     <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-base md:text-lg">CS</div>
                        <div>
                            <div className="text-base md:text-lg font-bold text-white">Carlos Silva</div>
                            <div className="text-xs md:text-sm text-slate-400">PSD - Vereador</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20 w-full md:w-auto justify-center md:justify-start">
                         <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                         <span className="text-green-500 font-bold text-xs md:text-sm uppercase tracking-wide">Votação Aberta</span>
                     </div>
                </div>

                {/* Tablet Body */}
                <div className="flex-1 p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center bg-slate-950">
                    {/* Left Column: Project Info */}
                    <div className="space-y-4 md:space-y-8">
                        <div className="space-y-2 md:space-y-4">
                            <span className="text-slate-500 text-base md:text-lg font-medium">PL 123/2024</span>
                            <h3 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                                Projeto de Lei Complementar - Segurança Pública
                            </h3>
                            <p className="text-slate-400 text-sm md:text-lg leading-relaxed line-clamp-3 md:line-clamp-none">
                                Dispõe sobre a implementação de sistemas de câmeras integradas em vias públicas e estabelece diretrizes para o tratamento de dados pessoais.
                            </p>
                        </div>

                        <div className="p-4 md:p-6 bg-slate-900/50 rounded-xl border border-slate-800 space-y-4">
                            <div className="flex justify-between items-center text-slate-400">
                                <span className="font-medium text-sm md:text-base">Tempo Restante para Voto</span>
                                <span className="text-white font-mono text-xl md:text-2xl font-bold">04:32</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full w-2/3 bg-blue-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Voting Actions */}
                    <div className="flex flex-col gap-3 md:gap-4 max-w-md mx-auto w-full">
                         <div className="text-center text-slate-400 mb-2 font-medium text-sm md:text-base">Selecione sua opção de voto</div>
                         
                         <button className="group w-full py-4 md:py-8 rounded-2xl bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white border-2 border-green-600/50 hover:border-green-600 transition-all duration-300 flex items-center justify-between px-6 md:px-8">
                             <span className="text-xl md:text-2xl font-bold">SIM</span>
                             <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-white/20">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                             </div>
                         </button>

                         <button className="group w-full py-4 md:py-8 rounded-2xl bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border-2 border-red-600/50 hover:border-red-600 transition-all duration-300 flex items-center justify-between px-6 md:px-8">
                             <span className="text-xl md:text-2xl font-bold">NÃO</span>
                             <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-white/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                             </div>
                         </button>

                          <button className="w-full py-4 md:py-6 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 transition-all font-semibold flex items-center justify-center gap-2 text-sm md:text-base">
                             Abster-se da Votação
                         </button>
                    </div>
                </div>
            </motion.div>
          
          {/* Decorative Elements */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-2xl opacity-20 -z-10" />
        </div>
      </div>
    </section>
  )
}
