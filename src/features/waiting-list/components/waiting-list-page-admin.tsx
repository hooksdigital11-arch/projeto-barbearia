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
    <div className="space-y-16 animate-premium-in">
      <WaitingListRealtime organizationId={organizationId} />

      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        <div className="flex-1 relative">
          <PageTitle 
            title="Fila" 
            subtitle="Gestão inteligente da lista de espera. Monitore o fluxo de entrada e otimize o tempo de resposta da equipe em tempo real." 
            className="mb-0" 
          />
          <div className="absolute top-0 right-0 lg:right-auto lg:left-32 lg:top-4 flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-4 px-10 py-8 bg-white text-black rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-accent-cyan transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-accent-cyan/20 active:scale-95 group ml-7 lg:ml-0"
        >
          <Plus size={22} weight="bold" className="group-hover:rotate-90 transition-transform duration-500" />
          Novo Registro
        </button>
      </div>

      {/* KPI Section - Precision Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 overflow-hidden">
        {[
          { title: 'Na Fila', value: stats.waiting, icon: Queue, color: '#8b5cf6', desc: 'Aguardando atendimento' },
          { title: 'Notificado', value: stats.notified, icon: Bell, color: '#3b82f6', desc: 'Avisado por mensagem' },
          { title: 'Confirmado', value: stats.confirmed, icon: CheckCircle, color: '#10b981', desc: 'Presença confirmada' },
          { title: 'Vagas', value: stats.openSlots, icon: CalendarX, color: '#00e5ff', desc: 'Slots disponíveis hoje' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-10 bg-black flex flex-col justify-between h-48 group">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
                {kpi.title}
              </p>
              <kpi.icon size={20} weight="bold" style={{ color: kpi.color }} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-5xl font-bold font-mono text-white tracking-tighter group-hover:text-accent-cyan transition-colors">
                {kpi.value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest opacity-30 group-hover:opacity-60 transition-opacity">
                {kpi.desc}
              </p>
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
    </div>
  )
}
