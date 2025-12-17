"use client"

import { motion } from "framer-motion"
import { 
  PieChart, 
  LayoutDashboard, 
  Vote, 
  Calendar, 
  FileText,
  ShieldCheck
} from "lucide-react"

const benefits = [
  {
    title: "Gestão Digital",
    description: "Gestão de vereadores e vereadoras, votação e sessões legislativas.",
    icon: PieChart,
  },
  {
    title: "Dashboard Inteligente",
    description: "Visualização clara de dados e indicadores em tempo real para tomada de decisão.",
    icon: LayoutDashboard,
  },
  {
    title: "Votação em Tempo Real",
    description: "Sistema seguro de registro de votos com exibição instantânea em painel.",
    icon: Vote,
  },
  {
    title: "Gestão de Sessões",
    description: "Organização completa da pauta, oradores e tempos de fala.",
    icon: Calendar,
  },
  {
    title: "Relatórios Automáticos",
    description: "Geração instantânea de atas e relatórios de votação.",
    icon: FileText,
  },
  {
    title: "Segurança Total",
    description: "Criptografia de ponta a ponta e auditabilidade completa dos dados.",
    icon: ShieldCheck,
  },
]

export function Benefits() {
  return (
    <section id="benefits" className="py-24 relative overflow-hidden bg-slate-950">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
          >
            Por que escolher o Vota Câmara?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400"
          >
            Tecnologia de ponta desenvolvida especificamente para modernizar o processo legislativo municipal.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} benefit={benefit} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BenefitCard({ benefit, index }: { benefit: any, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition-colors"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="mb-4 inline-flex p-3 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
          <benefit.icon className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-200 transition-colors">
          {benefit.title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          {benefit.description}
        </p>
      </div>
    </motion.div>
  )
}
