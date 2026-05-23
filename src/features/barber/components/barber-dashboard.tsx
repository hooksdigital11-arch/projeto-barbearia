'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Clock, 
  User, 
  ChartBar,
  Stop,
  BellRinging,
  List,
  CalendarSlash
} from '@phosphor-icons/react'
import { ServiceTimer } from './service-timer'
import { cn } from '@/lib/utils/cn'

import { useDashboardRealtime } from '@/features/analytics/useDashboardRealtime'

interface AppointmentItem {
  id: string
  time: string
  client: string
  service: string
  duration: string
  status: string
}

interface WaitingItem {
  id: string
  name: string
  waitingTime: string
}

interface CurrentClient {
  name: string
  todayService: string
  elapsedMinutes?: number
  visits: number
  rating: number
  totalSpent: string | number
}

interface BarberDashboardData {
  shift: string
  stats: {
    revenueDay: string | number
  }
  currentClient: CurrentClient | null
  appointments: AppointmentItem[]
  waitingList: WaitingItem[]
}

export function BarberDashboard({ initialData, organizationId }: { initialData: BarberDashboardData, organizationId: string }) {
  const router = useRouter()
  const [data, setData] = useState(initialData)

  // Sincronização Realtime Global
  useDashboardRealtime(organizationId)

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <style jsx global>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s infinite;
        }
      `}</style>

      {/* Cabeçalho */}
      <div className="space-y-2">
        <h1 className="text-[36px] font-medium tracking-[-0.02em] text-text-primary uppercase leading-none">
          Workspace<span className="text-accent-main">.</span>
        </h1>
        <p className="text-[11px] text-text-muted leading-[1.6] max-w-[360px] uppercase tracking-wide">
          Centro de controle do barbeiro. Monitore sua agenda, atenda clientes e gerencie seu desempenho em tempo real.
        </p>
      </div>

      {/* Barra de Status Operacional */}
      <div className="bg-bg-sidebar border border-border-main rounded-[10px] p-[16px_20px] flex flex-col md:flex-row md:items-center gap-4 md:gap-0">
        {/* Zona 1 — Status */}
        <div className="flex items-center gap-4 md:pr-10 md:border-r border-border-main">
          <div className="relative flex items-center justify-center">
            <div className="w-[10px] h-[10px] rounded-full bg-accent-main relative z-10" />
            <div className="absolute w-[10px] h-[10px] rounded-full bg-accent-main/15 animate-pulse-ring" />
          </div>
          <div>
            <p className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5">Status Operacional</p>
            <p className="text-[14px] font-medium text-text-primary leading-tight">Disponível</p>
          </div>
        </div>

        {/* Zona 2 — Metas */}
        <div className="md:flex-1 md:px-10 flex items-center gap-6 md:gap-12 md:border-r border-border-main">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-text-muted" weight="bold" />
            <div>
              <p className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5">Turno de Hoje</p>
              <p className="text-[13px] font-medium text-text-secondary leading-tight">{data.shift}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ChartBar size={16} className="text-text-muted" weight="bold" />
            <div>
              <p className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5">Receita Dia</p>
              <p className="text-[13px] font-medium text-accent-main leading-tight">R$ {data.stats.revenueDay}</p>
            </div>
          </div>
        </div>

        {/* Zona 3 — Botão Finalizar Turno */}
        <div className="md:pl-10">
          <button className="bg-accent-main text-black text-[11px] font-medium tracking-[0.06em] p-[10px_20px] rounded-[8px] flex items-center gap-2 hover:opacity-90 transition-all uppercase">
            <Stop size={14} weight="fill" />
            Finalizar Turno
          </button>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-[14px]">
        {/* Coluna Esquerda: Atendimento Ativo */}
        <div className="space-y-[14px]">
          {data.currentClient ? (
            <div className="bg-bg-sidebar border border-border-main rounded-[10px] p-8 min-h-[240px] flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <User size={120} weight="fill" />
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[12px] bg-bg-surface border border-border-main flex items-center justify-center text-xl font-medium text-accent-main">
                    {data.currentClient.name[0]}
                  </div>
                  <div>
                    <span className="text-[10px] text-accent-main font-medium uppercase tracking-[0.1em] mb-1 block">Atendimento Ativo</span>
                    <h3 className="text-2xl font-medium text-text-primary tracking-tight">{data.currentClient.name}</h3>
                    <p className="text-[11px] text-text-muted uppercase tracking-wider mt-1">{data.currentClient.todayService}</p>
                  </div>
                </div>
                <ServiceTimer initialMinutes={Math.floor(data.currentClient.elapsedMinutes || 0)} targetMinutes={45} />
              </div>

              <div className="grid grid-cols-3 gap-10 border-y border-border-main py-6 my-6 relative z-10">
                <div>
                  <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Visitas</p>
                  <p className="text-[16px] font-medium text-text-primary">{data.currentClient.visits}</p>
                </div>
                <div>
                  <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Avaliação</p>
                  <p className="text-[16px] font-medium text-text-primary">{data.currentClient.rating} ⭐</p>
                </div>
                <div>
                  <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Total Gasto</p>
                  <p className="text-[16px] font-medium text-accent-main">R$ {data.currentClient.totalSpent}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <button
                  onClick={() => router.push('/barber/comanda')}
                  className="flex-1 bg-accent-main text-black text-[11px] font-medium tracking-[0.06em] py-3.5 rounded-[8px] hover:opacity-90 transition-all uppercase">
                  Finalizar e Próximo
                </button>
                <button
                  onClick={() => router.push('/barber/comanda')}
                  className="px-6 py-3.5 bg-bg-surface border border-border-main text-text-primary text-[11px] font-medium rounded-[8px] hover:bg-nav-hover transition-all uppercase tracking-wider">
                  Comanda Digital
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-bg-sidebar border border-border-main rounded-[10px] min-h-[240px] flex flex-col items-center justify-center gap-[14px] p-8">
              <div className="w-[64px] h-[64px] rounded-full bg-bg-surface border border-border-main flex items-center justify-center text-text-muted">
                <User size={28} weight="regular" />
              </div>
              <div className="space-y-1 text-center">
                <h3 className="text-[14px] font-medium text-text-nav uppercase tracking-wider">Nenhum atendimento ativo</h3>
                <p className="text-[11px] text-text-muted max-w-[260px] leading-relaxed">
                  Chame o próximo cliente da fila ou agenda para começar o atendimento.
                </p>
              </div>
            </div>
          )}

          {/* Agenda do Período */}
          <div className="bg-bg-sidebar border border-border-main rounded-[10px] p-[18px_20px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[14px] font-medium text-text-secondary uppercase tracking-wider">Agenda do Período</h3>
              <button
                onClick={() => router.push('/barber/appointments')}
                className="text-[10px] text-text-muted hover:text-text-secondary transition-colors uppercase tracking-wider">
                Ver calendário completo →
              </button>
            </div>

            <div className="space-y-2">
              {data.appointments.length > 0 ? (
                data.appointments.map((apt: AppointmentItem) => (
                  <div
                    key={apt.id}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-[8px] border transition-all",
                      apt.status === 'in_progress' ? "bg-bg-surface border-accent-main/15" : "bg-transparent border-border-main hover:border-border-main/80"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className="text-[11px] font-medium text-text-secondary w-12">{apt.time}</div>
                      <div className="w-[1px] h-4 bg-border-main" />
                      <div>
                        <p className="text-[13px] font-medium text-text-primary tracking-tight">{apt.client}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">{apt.service} • {apt.duration}</p>
                      </div>
                    </div>
                    {apt.status === 'in_progress' && (
                      <div className="px-2 py-0.5 rounded bg-accent-main/5 border border-accent-main/15 text-accent-main text-[9px] font-medium uppercase tracking-wider">
                        Ativo
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-20">
                  <CalendarSlash size={28} className="text-border-main" />
                  <p className="text-[11px] text-text-muted uppercase tracking-widest">Sem agendamentos</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita */}
        <div className="space-y-[10px]">
          {/* Fila de Espera */}
          <div className="bg-bg-sidebar border border-border-main rounded-[10px] p-[16px]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-text-secondary">
                <List size={16} weight="bold" />
                <h3 className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">Fila de Espera</h3>
              </div>
              <span className="text-[10px] text-text-muted font-medium tracking-[0.06em] bg-bg-surface px-2 py-0.5 rounded uppercase">
                {data.waitingList.length} total
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {data.waitingList.length > 0 ? (
                data.waitingList.map((client: WaitingItem) => (
                  <div key={client.id} className="p-3 bg-bg-black border border-surface-secondary rounded-[8px] flex items-center justify-between group hover:border-border-main transition-all">
                    <div>
                      <p className="text-[12px] font-medium text-text-secondary tracking-tight">{client.name}</p>
                      <p className="text-[9px] text-text-muted uppercase tracking-wider">{client.waitingTime}</p>
                    </div>
                    <button className="text-[10px] text-accent-main hover:underline uppercase tracking-wider font-medium">
                      Chamar
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-text-muted text-center py-[28px] uppercase tracking-widest">
                  Fila vazia
                </div>
              )}
            </div>

            <button
              onClick={() => router.push('/barber/waiting-list')}
              className="w-full bg-bg-black border border-border-main rounded-[8px] p-[11px_14px] text-[10px] font-medium text-text-nav tracking-[0.07em] hover:border-border-main/60 hover:text-text-secondary transition-all uppercase text-center">
              Adicionar Cliente Manualmente
            </button>
          </div>

          {/* Card Aviso */}
          <div className="bg-[#0d1a2e] border border-[#1a3060] rounded-[10px] p-[14px_16px]">
            <div className="flex items-center gap-2 mb-2 text-[#6b9fff]">
              <BellRinging size={15} weight="bold" />
              <span className="text-[11px] font-medium uppercase tracking-[0.06em]">Aviso</span>
            </div>
            <p className="text-[10px] text-[#2a4060] leading-[1.6] uppercase tracking-tight">
              Lembre-se de sincronizar sua comanda digital a cada atendimento para garantir o fechamento correto do dia.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
