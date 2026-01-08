"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X, Landmark } from "lucide-react"

const navItems = [
  { name: "Início", href: "#hero" },
  { name: "Benefícios", href: "#benefits" },
  { name: "Recursos", href: "#features" },
  // { name: "Planos", href: "#pricing" },
  // { name: "Depoimentos", href: "#testimonials" },
]

export function Header() {
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      const offset = 80 // Height of header usually
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
      setMobileMenuOpen(false)
    }
  }

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled ? "bg-slate-950/80 backdrop-blur-md border-slate-800 py-3" : "bg-transparent py-5"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-10 h-10 bg-blue-600/20 rounded-lg border border-blue-500/30 group-hover:border-blue-400/50 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Landmark className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">Vota Câmara</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => scrollToSection(e, item.href)}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
            {/* <Button variant="ghost" className="text-slate-300 hover:text-white">
                Entrar
            </Button> */}
            <Link target="_blank" href="https://w.app/votacamara">
                <Button variant="neon" size="sm" className="rounded-full px-6">
                    Fale conosco
                </Button>
            </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
            {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-950 border-b border-slate-800 overflow-hidden"
        >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                {navItems.map((item) => (
                    <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => scrollToSection(e, item.href)}
                    className="text-base font-medium text-slate-300 hover:text-white py-2"
                    >
                    {item.name}
                    </a>
                ))}
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-800">
                    <Button variant="ghost" className="w-full justify-start text-slate-300">
                        Entrar
                    </Button>
                    <Button variant="neon" className="w-full">
                        Começar Agora
                    </Button>
                </div>
            </div>
        </motion.div>
      )}
    </motion.header>
  )
}
