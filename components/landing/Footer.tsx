export function Footer() {
  return (
    <footer className="py-12 bg-slate-950 border-t border-slate-900 text-slate-400 text-sm">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                VC
            </div>
            <span className="text-white font-semibold text-lg">Vota Câmara</span>
        </div>
        
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
