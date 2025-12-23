"use client"

import { useState, useRef, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { format, isSameDay, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { 
    Calendar as CalendarIcon, 
    Clock, 
    ListFilter, 
    ChevronLeft, 
    ChevronRight,
    MapPin,
    Users as UsersIcon,
    FileText
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

interface Projeto {
    id: string
    titulo: string
    numero: string
}

interface PautaItem {
    projeto_id: string
    projetos: Projeto
}

interface Sessao {
  id: string
  titulo: string
  tipo: string
  status: string
  iniciou_em: string
  pauta_itens?: PautaItem[]
}

interface AgendaSchedulerProps {
  initialSessoes: Sessao[]
}

export function AgendaScheduler({ initialSessoes }: AgendaSchedulerProps) {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date())
  const [selectedSessao, setSelectedSessao] = useState<Sessao | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const calendarRef = useRef<FullCalendar>(null)

  // Sync mini-calendar with FullCalendar
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date)
    if (date && calendarRef.current) {
      calendarRef.current.getApi().gotoDate(date)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberta": return "#22c55e" // green-500
      case "encerrada": return "#71717a" // zinc-500
      case "agendada": return "#3b82f6" // blue-500
      default: return "#71717a"
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case "aberta": return "Em Andamento"
      case "encerrada": return "Finalizada"
      case "agendada": return "Agendada"
      default: return status
    }
  }

  // Transform sessoes for FullCalendar
  const events = initialSessoes.map(s => {
    const start = parseISO(s.iniciou_em)
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000) // Default 2h duration
    
    return {
      id: s.id,
      title: s.titulo,
      start: start.toISOString(),
      end: end.toISOString(),
      backgroundColor: getStatusColor(s.status) + '22', // 22 is ~13% opacity
      borderColor: getStatusColor(s.status),
      textColor: 'white',
      extendedProps: { ...s }
    }
  })

  const handleEventClick = (info: any) => {
    setSelectedSessao(info.event.extendedProps as Sessao)
    setIsModalOpen(true)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px] px-4 pb-4">
      {/* Left Sidebar: Controls & Mini-Calendar */}
      <div className="w-full lg:w-80 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl border-none">
          <CardContent className="p-4 flex flex-col items-center">
            <style>{`
              .rdp {
                --rdp-cell-size: 38px;
                --rdp-accent-color: #3b82f6;
                margin: 0;
              }
            `}</style>
            <Calendar
              mode="single"
              selected={selectedDay}
              onSelect={handleDateSelect}
              className="text-white"
            />
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-blue-500" />
                Legenda
            </h3>
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="text-xs text-zinc-400">Sessão Agendada</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-xs text-zinc-400">Sessão em Andamento</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-zinc-500" />
                    <span className="text-xs text-zinc-400">Sessão Finalizada</span>
                </div>
            </div>
        </div>

        {/* Search/Filter (Visual only for now matching image) */}
        <div className="mt-auto p-4 bg-blue-600/5 border border-blue-500/10 rounded-xl">
            <p className="text-xs text-blue-400/60 leading-relaxed italic">
                Dica: Clique em qualquer sessão no calendário para ver o detalhamento completo da pauta e projetos associados.
            </p>
        </div>
      </div>

      {/* Main Area: FullCalendar */}
      <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative">
        <style>{`
          .fc {
            --fc-border-color: #27272a;
            --fc-daygrid-event-dot-width: 8px;
            --fc-today-bg-color: rgba(59, 130, 246, 0.05);
            background: transparent;
            color: #d4d4d8;
            height: 100% !important;
            font-family: inherit;
          }
          .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: 800; color: white; text-transform: capitalize; }
          .fc .fc-button { 
            background: #18181b; border: 1px solid #27272a; color: #a1a1aa; font-weight: 600; font-size: 0.8rem;
            text-transform: capitalize; padding: 6px 12px; transition: all 0.2s;
          }
          .fc .fc-button:hover { background: #27272a; color: white; border-color: #3f3f46; }
          .fc .fc-button-active { background: #3b82f6 !important; color: white !important; border-color: #3b82f6 !important; box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
          
          .fc .fc-timegrid-slot { height: 3.5em; border-bottom: 1px solid #18181b; }
          .fc .fc-timegrid-slot-label-cushion { color: #52525b; font-size: 0.7rem; font-weight: 600; }
          .fc .fc-col-header-cell-cushion { padding: 12px; color: #a1a1aa; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
          
          .fc-event { 
            border-radius: 6px; border-left: 4px solid !important; padding: 4px 6px; margin: 2px;
            cursor: pointer; transition: transform 0.1s;
          }
          .fc-event:hover { transform: scale(1.02); }
          .fc-v-event .fc-event-main { color: white; font-weight: 600; font-size: 0.75rem; }
          
          .fc .fc-scrollgrid { border-radius: 12px; overflow: hidden; border: none; }
          .fc-theme-standard td, .fc-theme-standard th { border: 1px solid #18181b; }
          
          .fc .fc-day-today { background: rgba(59, 130, 246, 0.03) !important; }
        `}</style>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,today,next',
            center: 'title',
            right: 'timeGridWeek,dayGridMonth'
          }}
          locale="pt-br"
          buttonText={{
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia'
          }}
          dayHeaderFormat={{ weekday: 'short' }}
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="23:00:00"
          events={events}
          eventClick={handleEventClick}
          height="100%"
          expandRows={true}
          nowIndicator={true}
          dayMaxEvents={true}
        />
      </div>

      {/* Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#09090b] border-zinc-800 text-white sm:max-w-[600px] overflow-hidden p-0 gap-0">
          {selectedSessao && (
            <>
              <div className="h-32 bg-gradient-to-br from-blue-600/20 to-zinc-900 border-b border-zinc-800 p-8 flex flex-col justify-end relative">
                <div className="absolute top-8 right-8">
                    <Badge variant="outline" className={`px-4 py-1 text-sm font-bold border-2 ${getStatusColor(selectedSessao.status === 'aberta' ? 'aberta' : selectedSessao.status === 'agendada' ? 'agendada' : 'encerrada')}`}>
                        {formatStatus(selectedSessao.status)}
                    </Badge>
                </div>
                <DialogTitle className="text-3xl font-black text-white italic uppercase tracking-tighter">
                    {selectedSessao.titulo}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Detalhes da sessão {selectedSessao.titulo}
                </DialogDescription>
                <div className="flex gap-4 mt-2 text-zinc-400 text-sm font-medium">
                    <span className="flex items-center gap-1.5">
                        <CalendarIcon className="h-4 w-4" />
                        {format(parseISO(selectedSessao.iniciou_em), "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {format(parseISO(selectedSessao.iniciou_em), "HH:mm")}
                    </span>
                </div>
              </div>

              <div className="p-8 space-y-8 max-h-[500px] overflow-y-auto custom-scrollbar">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Tipo de Sessão</p>
                        <p className="text-sm text-white font-medium flex items-center gap-2 capitalize">
                            <ListFilter className="h-4 w-4 text-zinc-400" />
                            {selectedSessao.tipo}
                        </p>
                    </div>
                     <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Localização</p>
                        <p className="text-sm text-white font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-zinc-400" />
                            Plenário Principal
                        </p>
                    </div>
                </div>

                {/* Agenda Items */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            Pauta da Sessão
                        </h3>
                        <Badge className="bg-blue-600/20 text-blue-400 border-none px-3">
                            {selectedSessao.pauta_itens?.length || 0} Projetos
                        </Badge>
                    </div>

                    <div className="space-y-3">
                        {!selectedSessao.pauta_itens || selectedSessao.pauta_itens.length === 0 ? (
                            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl text-center">
                                <p className="text-zinc-500 text-sm">Nenhum projeto associado a esta sessão.</p>
                            </div>
                        ) : (
                            selectedSessao.pauta_itens.map((item, idx) => (
                                <div 
                                    key={item.projeto_id}
                                    className="flex items-center gap-4 p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl hover:bg-zinc-900/50 transition-colors group"
                                >
                                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold group-hover:text-blue-500 transition-colors shadow-inner">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                                            {item.projetos.titulo}
                                        </p>
                                        <p className="text-[10px] text-zinc-500 font-medium">
                                            Projeto de Lei Nº {item.projetos.numero}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800">
                                        Explorar
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
              </div>

              <div className="p-6 border-t border-zinc-800 bg-zinc-900/20 flex gap-3">
                <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95"
                    onClick={() => window.location.href = `sessoes`}
                >
                    Acessar Página da Sessão
                </Button>
                <Button 
                    variant="outline" 
                    className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 h-12 px-6 rounded-xl"
                    onClick={() => setIsModalOpen(false)}
                >
                    Fechar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
