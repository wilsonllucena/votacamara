import { Landmark } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 bg-slate-950 border-t border-slate-900 text-slate-400 text-sm">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-10 h-10 bg-blue-600/20 rounded-lg border border-blue-500/30 group-hover:border-blue-400/50 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Landmark className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">Vota Câmara</span>
        </Link>
        
        <div className="flex gap-8">
            <a href="#" className="hover:text-blue-400 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Suporte</a>
        </div>

        <div>
            &copy; {new Date().getFullYear()} Vota Câmara. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
