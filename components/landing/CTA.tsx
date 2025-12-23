"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden bg-slate-950">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 -z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            Transforme sua gestão legislativa <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              hoje mesmo.
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Junte-se a dezenas de Câmaras Municipais que já modernizaram suas sessões com o Vota Câmara.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link target="_blank" href="https://w.app/votacamara">
            <Button size="lg" variant="neon" className="h-16 px-10 text-lg w-full sm:w-auto">
              Falar com Especialista
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            </Link>
            
            {/* <Button size="lg" variant="outline" className="h-16 px-10 text-lg w-full sm:w-auto bg-transparent border-slate-700 hover:bg-slate-800 text-white">
              Falar com Especialista
            </Button> */}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
