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

interface WaitingListPageBarberProps {
  entries: WaitingListEntry[]
  stats: QueueStats
  services: ServiceOption[]
  barbers: BarberOption[]
  clients: ClientOption[]
  organizationId: string
}

export function WaitingListPageBarber({
  entries,
  stats,
  services,
  barbers,
  clients,
  organizationId,
}: WaitingListPageBarberProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <WaitingListRealtime organizationId={organizationId} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <PageTitle
            title="Fila de Espera"
            subtitle="Clientes aguardando vaga"
            className="mb-0"
          />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 self-start mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">Ao vivo</span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-accent-cyan text-black font-bold text-sm hover:bg-accent-cyan/90 transition-all shadow-lg shadow-accent-cyan/20"
        >
          <Plus size={18} weight="bold" />
          Adicionar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="Na Fila"
          value={stats.waiting}
          icon={<Queue size={20} weight="duotone" />}
        />
        <KPICard
          title="Notificado"
          value={stats.notified}
          icon={<Bell size={20} weight="duotone" />}
        />
        <KPICard
          title="Confirmado"
          value={stats.confirmed}
          icon={<CheckCircle size={20} weight="duotone" />}
        />
        <KPICard
          title="Vagas Abertas"
          value={stats.openSlots}
          subtitle="cancelamentos hoje"
          icon={<CalendarX size={20} weight="duotone" />}
        />
      </div>

      {/* Queue List */}
      {entries.length === 0 ? (
        <EmptyState
          title="Fila vazia"
          description="Nenhum cliente aguardando vaga no momento."
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
            <WaitingListCard key={entry.id} entry={entry} role="barber" />
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
