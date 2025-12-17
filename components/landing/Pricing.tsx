"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Essencial",
    price: "R$ 890",
    period: "/mês",
    description: "Para câmaras pequenas que precisam iniciar a digitalização.",
    features: [
      "Painel de votação básico",
      "Registro de presença",
      "Relatórios em PDF",
      "Suporte por e-mail",
      "Até 9 vereadores"
    ],
    highlight: false
  },
  {
    name: "Profissional",
    price: "R$ 1.490",
    period: "/mês",
    description: "A escolha ideal para maior controle e eficiência legislativa.",
    features: [
      "Painel de votação em tempo real",
      "Gestão de tempo de fala",
      "Dashboard analítico completo",
      "Suporte prioritário WhatsApp",
      "Backup automático diário",
      "Até 15 vereadores"
    ],
    highlight: true
  },
  {
    name: "Empresa Plus",
    price: "Sob Consulta",
    period: "",
    description: "Solução personalizada para grandes câmaras e necessidades específicas.",
    features: [
      "Tudo do plano Profissional",
      "Integração via API",
      "Treinamento presencial",
      "Gerente de conta dedicado",
      "Vereadores ilimitados",
      "Customização de relatórios"
    ],
    highlight: false
  }
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-slate-950">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 text-white"
          >
            Planos Transparente
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400"
          >
            Escolha a melhor opção para a realidade do seu município. Sem taxas ocultas.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingCard({ plan, index }: { plan: any, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
      className={cn(
        "relative rounded-2xl p-8 border backdrop-blur-sm transition-all duration-300",
        plan.highlight 
          ? "bg-slate-900/80 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.15)] scale-105 z-10" 
          : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
      )}
    >
      {plan.highlight && (
        <div className="absolute -top-4 inset-x-0 flex justify-center">
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Mais Popular
          </span>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-bold text-white">{plan.price}</span>
          <span className="text-slate-400">{plan.period}</span>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">
          {plan.description}
        </p>
      </div>

      <ul className="space-y-4 mb-8">
        {plan.features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
            <Check className="h-5 w-5 text-blue-500 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button 
        className="w-full h-12" 
        variant={plan.highlight ? "neon" : "outline"}
      >
        Escolher Plano
      </Button>
    </motion.div>
  )
}
