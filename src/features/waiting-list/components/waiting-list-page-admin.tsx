'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import {
  Queue,
  Bell,
  CheckCircle,
  CalendarX,
  Plus,
} from '@phosphor-icons/react'
import { KPICard } from '@/components/shared/kpi-card'
import { PageTitle } from '@/components/shared/page-title'
import { EmptyState } from '@/components/shared/empty-state'
import { WaitingListRealtime } from './waiting-list-realtime'
import type { WaitingListEntry, QueueStats, ServiceOption, BarberOption, ClientOption } from '../types'

const AddToQueueModal = dynamic(() => import('./add-to-queue-modal').then(m => m.AddToQueueModal), { ssr: false })
const WaitingListCard = dynamic(() => import('./waiting-list-card').then(m => m.WaitingListCard), { ssr: false })

interface WaitingListPageAdminProps {
  entries: WaitingListEntry[]
  stats: QueueStats
  services: ServiceOption[]
  barbers: BarberOption[]
  clients: ClientOption[]
  organizationId: string
}

export function WaitingListPageAdmin({
  entries,
  stats,
  services,
  barbers,
  clients,
  organizationId,
}: WaitingListPageAdminProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <WaitingListRealtime organizationId={organizationId} />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16 animate-in fade-in duration-1000">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-12 bg-accent-cyan rounded-full shadow-[0_0_30px_rgba(0,229,255,0.4)]" />
            <h1 className="text-5xl md:text-7xl font-black font-syne text-white tracking-tighter leading-none uppercase">
              Fila<span className="text-accent-cyan">.</span>
            </h1>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 ml-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
            </div>
          </div>
          <p className="text-text-secondary text-lg font-medium max-w-xl ml-7 border-l border-white/10 pl-6">
            Gestão inteligente da lista de espera. Monitore o fluxo de entrada e otimize o tempo de resposta da equipe em tempo real.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-4 px-8 py-4 bg-white text-black rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-accent-cyan transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-accent-cyan/20 active:scale-95 group ml-7 lg:ml-0"
        >
          <Plus size={22} weight="bold" className="group-hover:rotate-90 transition-transform duration-500" />
          Novo Registro
        </button>
      </div>

      {/* KPI Cards com Design Pro Max */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          { title: 'Na Fila', value: stats.waiting, icon: Queue, color: '#8b5cf6', desc: 'Aguardando atendimento' },
          { title: 'Notificado', value: stats.notified, icon: Bell, color: '#3b82f6', desc: 'Avisado por mensagem' },
          { title: 'Confirmado', value: stats.confirmed, icon: CheckCircle, color: '#10b981', desc: 'Presença confirmada' },
          { title: 'Vagas', value: stats.openSlots, icon: CalendarX, color: '#00e5ff', desc: 'Slots disponíveis hoje' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-white/[0.03] border border-white/10 group-hover:scale-110 transition-transform">
                <kpi.icon size={24} weight="duotone" style={{ color: kpi.color }} />
              </div>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{kpi.label || kpi.title}</h4>
              <p className="text-4xl font-bold text-white tabular-nums tracking-tighter">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest opacity-50">{kpi.desc}</p>
            </div>
            <div className="absolute -bottom-2 -right-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <kpi.icon size={80} weight="duotone" />
            </div>
          </div>
        ))}
      </div>

      {/* Queue List */}
      {entries.length === 0 ? (
        <EmptyState
          title="Fila vazia"
          description="Nenhum cliente na fila de espera. Adicione clientes quando não houver horários disponíveis."
          icon={<Queue size={48} weight="duotone" />}
          action={
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors text-sm font-medium"
            >
              + Adicionar à fila
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <WaitingListCard key={entry.id} entry={entry} role="admin" />
          ))}
        </div>
      )}

      {/* Modal */}
      <AddToQueueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        services={services}
        barbers={barbers}
        clients={clients}
      />
    </>
  )
}
