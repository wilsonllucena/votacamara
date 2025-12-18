"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, PlayCircle } from "lucide-react"

export function Hero() {
  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0B1121] py-20 lg:py-0">
       {/* Ambient Spotlight */}
       <div className="absolute top-0 right-0 w-full h-full max-w-[1200px] pointer-events-none opacity-40">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen" />
       </div>

       {/* Grid Pattern Overlay */}
       <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="container mx-auto relative z-10 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Content */}
            <div className="flex flex-col items-start text-left lg:pr-8">
                 {/* <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                 >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Nova Versão 2025
                    </div>
                </motion.div> */}

                <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                >
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
                    O Futuro da <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                       Gestão Legislativa
                    </span>
                  </h1>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="text-lg text-slate-400 mb-8 leading-relaxed max-w-xl"
                >
                  Modernize sua Câmara Municipal com transparência total. 
                  Sessões ao vivo, votação eletrônica segura e gestão de documentos em uma única plataforma intuitiva.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                >
                  <Button size="lg" className="h-14 px-8 text-base rounded-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all hover:scale-105">
                    Fale com Consultor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  {/* <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-slate-700 bg-transparent hover:bg-slate-800 text-white transition-all">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Ver Demonstração
                  </Button> */}
                </motion.div>
                
                {/* <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 flex items-center gap-8 text-slate-500 text-sm font-medium"
                >
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {[1,2,3,4].map(i => (
                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#0B1121] bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold z-[${i}]`}>
                                    {String.fromCharCode(64+i)}
                                </div>
                            ))}
                        </div>
                        <p>+500 Câmaras Ativas</p>
                    </div>
                </motion.div> */}
            </div>

            {/* Right Column: Visual (Laptop Mockup) */}
            <motion.div
                initial={{ opacity: 0, x: 50, rotateY: -10 }}
                animate={{ opacity: 1, x: 0, rotateY: -5 }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                className="hidden min-[480px]:block relative perspective-[2000px] group"
            >
                 {/* Decorative Glow Behind Laptop */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 blur-[80px] rounded-full -z-10" />

                 {/* Laptop Container */}
                 <div className="relative mx-auto w-full max-w-[800px] transform transition-transform duration-500 group-hover:rotate-y-0 group-hover:scale-[1.02]">
                    
                    {/* Screen Frame */}
                    <div className="relative bg-[#1a1b26] rounded-t-2xl p-[2%] pb-0 shadow-2xl ring-1 ring-white/10">
                        {/* Camera */}
                        <div className="absolute top-[4%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-800 ring-1 ring-slate-700"></div>

                        {/* Screen Content (The Dashboard) */}
                        <div className="bg-black rounded-t-lg overflow-hidden w-full aspect-[16/10] relative flex font-sans select-none">
                             {/* Mock Sidebar (Left) */}
                             <div className="w-[22%] h-full bg-zinc-950 border-r border-zinc-900 flex flex-col p-3 gap-3">
                                 {/* Logo Area */}
                                 <div className="flex items-center gap-2 mb-2">
                                     <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">V</div>
                                     <span className="text-[10px] font-bold text-zinc-300">VotaCâmara</span>
                                 </div>
                                 
                                 {/* Nav Items */}
                                 <div className="space-y-1">
                                     {['Dashboard', 'Sessões', 'Vereadores', 'Projetos', 'Votações'].map((item, i) => (
                                         <div key={i} className={`flex items-center gap-2 p-1.5 rounded ${i === 0 ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>
                                             <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-zinc-800'}`}></div>
                                             <span className="text-[8px] font-medium">{item}</span>
                                         </div>
                                     ))}
                                 </div>
                                 
                                 <div className="mt-auto flex items-center gap-2 p-1.5 bg-zinc-900/50 rounded border border-zinc-800">
                                     <div className="w-4 h-4 rounded-full bg-zinc-700"></div>
                                     <div className="flex-1">
                                         <div className="h-1 bg-zinc-700 rounded w-full mb-0.5"></div>
                                         <div className="h-1 bg-zinc-700 rounded w-2/3"></div>
                                     </div>
                                 </div>
                             </div>

                             {/* Mock Main Content */}
                             <div className="flex-1 flex flex-col bg-black">
                                 {/* Header Area */}
                                 <div className="h-10 border-b border-zinc-900 flex items-center justify-between px-4">
                                     <span className="text-[10px] font-medium text-zinc-400">Visão Geral</span>
                                     <div className="flex gap-2">
                                         <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[8px] text-blue-400">Sessão Ao Vivo</div>
                                     </div>
                                 </div>

                                 {/* Content Grid */}
                                 <div className="p-4 grid grid-cols-3 gap-3">
                                     {/* Cards */}
                                     <div className="col-span-1 rounded-lg bg-zinc-900/30 border border-zinc-800 p-3">
                                         <div className="text-[8px] text-zinc-500 mb-1">Total Parlamentares</div>
                                         <div className="text-lg font-bold text-white leading-none">15</div>
                                         <div className="text-[8px] text-green-500 mt-1">+12 presentes</div>
                                     </div>
                                     <div className="col-span-1 rounded-lg bg-zinc-900/30 border border-zinc-800 p-3">
                                         <div className="text-[8px] text-zinc-500 mb-1">Projetos no Mês</div>
                                         <div className="text-lg font-bold text-white leading-none">42</div>
                                         <div className="text-[8px] text-blue-500 mt-1">8 em votação</div>
                                     </div>
                                     <div className="col-span-1 rounded-lg bg-zinc-900/30 border border-zinc-800 p-3">
                                         <div className="text-[8px] text-zinc-500 mb-1">Sessões Realizadas</div>
                                         <div className="text-lg font-bold text-white leading-none">28</div>
                                         <div className="text-[8px] text-purple-500 mt-1">98% frequência</div>
                                     </div>
                                     
                                     {/* Active Session Area */}
                                     <div className="col-span-3 mt-1 rounded-lg bg-zinc-900/20 border border-zinc-800 overflow-hidden">
                                         <div className="px-3 py-2 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
                                             <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                <span className="text-[9px] font-bold text-white">Sessão Ordinária #42.2024</span>
                                             </div>
                                             <span className="text-[8px] text-zinc-500">Iniciada às 14:00</span>
                                         </div>
                                         <div className="p-3 grid grid-cols-2 gap-4">
                                             <div className="space-y-2">
                                                 <div className="text-[8px] font-semibold text-zinc-400 uppercase tracking-wider">Em Votação</div>
                                                 <div className="text-[10px] text-white font-medium leading-tight">
                                                     PL 123/2024 - Dispõe sobre a modernização do sistema de segurança pública municipal.
                                                 </div>
                                                 <div className="flex gap-1 mt-2">
                                                     <div className="h-1 flex-1 bg-green-500 rounded-full"></div>
                                                     <div className="h-1 w-[20%] bg-red-500 rounded-full"></div>
                                                 </div>
                                                 <div className="flex justify-between text-[8px] text-zinc-500">
                                                     <span>12 SIM</span>
                                                     <span>3 NÃO</span>
                                                 </div>
                                             </div>
                                             <div className="space-y-1.5 border-l border-zinc-800 pl-4">
                                                 <div className="text-[8px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Próximos Itens</div>
                                                 {['PL 124/2024 - Educação Digital', 'Moção 05/2024 - Pesar', 'Req. 45/2024 - Obras'].map((item, i) => (
                                                     <div key={i} className="flex items-center gap-2">
                                                         <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                                                         <span className="text-[8px] text-zinc-400 truncate">{item}</span>
                                                     </div>
                                                 ))}
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Keyboard Base (Bottom Half of Laptop) */}
                    <div className="relative bg-[#252630] h-[3%] rounded-b-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] z-20 mx-[0.5%]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[15%] h-full bg-[#1a1b26] rounded-b-md"></div>
                    </div>

                 </div>

            </motion.div>

        </div>
      </div>
    </section>
  )
}
