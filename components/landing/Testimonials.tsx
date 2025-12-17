"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

const testimonials = [
  {
    name: "Carlos Mendes",
    role: "Presidente da Câmara - São José",
    content: "O Vota Câmara revolucionou nossas sessões. A transparência aumentou significativamente e a população aprovou a modernização.",
  },
  {
    name: "Ana Souza",
    role: "Diretora Legislativa - Itapema",
    content: "A agilidade na geração das atas e relatórios nos poupou horas de trabalho manual. Sistema indispensável.",
  },
  {
    name: "Ricardo Oliveira",
    role: "Vereador - Blumenau",
    content: "Interface muito intuitiva. Mesmo os vereadores com menos afinidade tecnológica se adaptaram rapidamente.",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-slate-950 border-y border-slate-900/50">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center text-white mb-16">
          O que dizem nossos parceiros
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="bg-slate-900 border-slate-800 h-full">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="mb-6">
                    <Quote className="h-8 w-8 text-blue-500/50" />
                  </div>
                  <p className="text-slate-300 mb-6 flex-1 text-lg leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
