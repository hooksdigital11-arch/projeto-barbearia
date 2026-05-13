'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Clock, 
  CheckCircle, 
  User, 
  ArrowRight,
  ListNumbers,
  ChartBar,
  Phone,
  UserMinus,
  Coffee,
  SignOut,
  Stop,
  BellRinging,
  CalendarBlank,
  List,
  CalendarSlash
} from '@phosphor-icons/react'
import { ServiceTimer } from './service-timer'
import { QuickNotes } from './quick-notes'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'

import { useDashboardRealtime } from '@/features/analytics/useDashboardRealtime'

export function BarberDashboard({ initialData, organizationId }: { initialData: any, organizationId: string }) {
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
        <h1 className="text-[36px] font-medium tracking-[-0.02em] text-[#fff] uppercase leading-none">
          Workspace<span className="text-[#00d4aa]">.</span>
        </h1>
        <p className="text-[11px] text-[#333] leading-[1.6] max-w-[360px] uppercase tracking-wide">
          Centro de controle do barbeiro. Monitore sua agenda, atenda clientes e gerencie seu desempenho em tempo real.
        </p>
      </div>

      {/* Barra de Status Operacional */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] p-[16px_20px] flex items-center gap-0">
        {/* Zona 1 — Status */}
        <div className="flex items-center gap-4 pr-10 border-r border-[#1a1a1a]">
          <div className="relative flex items-center justify-center">
            <div className="w-[10px] h-[10px] rounded-full bg-[#00d4aa] relative z-10" />
            <div className="absolute w-[10px] h-[10px] rounded-full bg-[#00d4aa22] animate-pulse-ring" />
          </div>
          <div>
            <p className="text-[9px] text-[#2a2a2a] uppercase tracking-wider mb-0.5">Status Operacional</p>
            <p className="text-[14px] font-medium text-[#fff] leading-tight">Disponível</p>
          </div>
        </div>

        {/* Zona 2 — Metas */}
        <div className="flex-1 px-10 flex items-center gap-12 border-r border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-[#2a2a2a]" weight="bold" />
            <div>
              <p className="text-[9px] text-[#2a2a2a] uppercase tracking-wider mb-0.5">Turno de Hoje</p>
              <p className="text-[13px] font-medium text-[#ccc] leading-tight">{data.shift}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ChartBar size={16} className="text-[#2a2a2a]" weight="bold" />
            <div>
              <p className="text-[9px] text-[#2a2a2a] uppercase tracking-wider mb-0.5">Receita Dia</p>
              <p className="text-[13px] font-medium text-[#00d4aa] leading-tight">R$ {data.stats.revenueDay}</p>
            </div>
          </div>
        </div>

        {/* Zona 3 — Botão Finalizar Turno */}
        <div className="pl-10">
          <button className="bg-[#fff] text-[#000] text-[11px] font-medium tracking-[0.06em] p-[10px_20px] rounded-[8px] flex items-center gap-2 hover:bg-[#e8e8e8] transition-all uppercase">
            <Stop size={14} weight="fill" />
            Finalizar Turno
          </button>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-[1fr_280px] gap-[14px]">
        {/* Coluna Esquerda: Atendimento Ativo */}
        <div className="space-y-[14px]">
          {data.currentClient ? (
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] p-8 min-h-[240px] flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <User size={120} weight="fill" />
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[12px] bg-[#141414] border border-[#1e1e1e] flex items-center justify-center text-xl font-medium text-[#00d4aa]">
                    {data.currentClient.name[0]}
                  </div>
                  <div>
                    <span className="text-[10px] text-[#00d4aa] font-medium uppercase tracking-[0.1em] mb-1 block">Atendimento Ativo</span>
                    <h3 className="text-2xl font-medium text-[#fff] tracking-tight">{data.currentClient.name}</h3>
                    <p className="text-[11px] text-[#333] uppercase tracking-wider mt-1">{data.currentClient.todayService}</p>
                  </div>
                </div>
                <ServiceTimer initialMinutes={Math.floor(data.currentClient.elapsedMinutes || 0)} targetMinutes={45} />
              </div>

              <div className="grid grid-cols-3 gap-10 border-y border-[#1a1a1a] py-6 my-6 relative z-10">
                <div>
                  <p className="text-[9px] text-[#2a2a2a] uppercase tracking-wider mb-1">Visitas</p>
                  <p className="text-[16px] font-medium text-[#fff]">{data.currentClient.visits}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#2a2a2a] uppercase tracking-wider mb-1">Avaliação</p>
                  <p className="text-[16px] font-medium text-[#fff]">{data.currentClient.rating} ⭐</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#2a2a2a] uppercase tracking-wider mb-1">Total Gasto</p>
                  <p className="text-[16px] font-medium text-[#00d4aa]">R$ {data.currentClient.totalSpent}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <button className="flex-1 bg-[#00d4aa] text-[#000] text-[11px] font-medium tracking-[0.06em] py-3.5 rounded-[8px] hover:brightness-110 transition-all uppercase">
                  Finalizar e Próximo
                </button>
                <button className="px-6 py-3.5 bg-[#141414] border border-[#1e1e1e] text-[#fff] text-[11px] font-medium rounded-[8px] hover:bg-[#1a1a1a] transition-all uppercase tracking-wider">
                  Comanda Digital
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] min-h-[240px] flex flex-col items-center justify-center gap-[14px] p-8">
              <div className="w-[64px] h-[64px] rounded-full bg-[#141414] border border-[#1e1e1e] flex items-center justify-center text-[#2a2a2a]">
                <User size={28} weight="regular" />
              </div>
              <div className="space-y-1 text-center">
                <h3 className="text-[14px] font-medium text-[#555] uppercase tracking-wider">Nenhum atendimento ativo</h3>
                <p className="text-[11px] text-[#2a2a2a] max-w-[260px] leading-relaxed">
                  Chame o próximo cliente da fila ou agenda para começar o atendimento.
                </p>
              </div>
            </div>
          )}

          {/* Agenda do Período */}
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] p-[18px_20px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[14px] font-medium text-[#bbb] uppercase tracking-wider">Agenda do Período</h3>
              <button className="text-[10px] text-[#2e2e2e] hover:text-[#444] transition-colors uppercase tracking-wider">
                Ver calendário completo →
              </button>
            </div>
            
            <div className="space-y-2">
              {data.appointments.length > 0 ? (
                data.appointments.map((apt: any) => (
                  <div 
                    key={apt.id}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-[8px] border transition-all",
                      apt.status === 'in_progress' ? "bg-[#141414] border-[#00d4aa22]" : "bg-transparent border-[#1a1a1a] hover:border-[#222]"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className="text-[11px] font-medium text-[#444] w-12">{apt.time}</div>
                      <div className="w-[1px] h-4 bg-[#1a1a1a]" />
                      <div>
                        <p className="text-[13px] font-medium text-[#fff] tracking-tight">{apt.client}</p>
                        <p className="text-[10px] text-[#2a2a2a] uppercase tracking-wider mt-0.5">{apt.service} • {apt.duration}</p>
                      </div>
                    </div>
                    {apt.status === 'in_progress' && (
                      <div className="px-2 py-0.5 rounded bg-[#00d4aa11] border border-[#00d4aa22] text-[#00d4aa] text-[9px] font-medium uppercase tracking-wider">
                        Ativo
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-20">
                  <CalendarSlash size={28} className="text-[#1e1e1e]" />
                  <p className="text-[11px] text-[#222] uppercase tracking-widest">Sem agendamentos</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita */}
        <div className="space-y-[10px]">
          {/* Fila de Espera */}
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] p-[16px]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-[#444]">
                <List size={16} weight="bold" />
                <h3 className="text-[13px] font-medium text-[#bbb] uppercase tracking-wider">Fila de Espera</h3>
              </div>
              <span className="text-[10px] text-[#2a2a2a] font-medium tracking-[0.06em] bg-[#141414] px-2 py-0.5 rounded uppercase">
                {data.waitingList.length} total
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {data.waitingList.length > 0 ? (
                data.waitingList.map((client: any) => (
                  <div key={client.id} className="p-3 bg-[#0d0d0d] border border-[#161616] rounded-[8px] flex items-center justify-between group hover:border-[#1a1a1a] transition-all">
                    <div>
                      <p className="text-[12px] font-medium text-[#ccc] tracking-tight">{client.name}</p>
                      <p className="text-[9px] text-[#2a2a2a] uppercase tracking-wider">{client.waitingTime}</p>
                    </div>
                    <button className="text-[10px] text-[#00d4aa] hover:underline uppercase tracking-wider font-medium">
                      Chamar
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-[#222] text-center py-[28px] uppercase tracking-widest">
                  Fila vazia
                </div>
              )}
            </div>

            <button className="w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-[8px] p-[11px_14px] text-[10px] font-medium text-[#555] tracking-[0.07em] hover:border-[#2a2a2a] hover:text-[#888] transition-all uppercase text-center">
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
