'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import {
  ListBullets,
  Bell,
  CheckCircle,
  Calendar,
  Plus,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
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
    <div className="animate-premium-in py-8 space-y-12">
      <WaitingListRealtime organizationId={organizationId} />

      <style jsx global>{`
        @keyframes custom-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-custom-pulse {
          animation: custom-pulse 1.5s infinite ease-in-out;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-[32px] font-medium text-text-primary tracking-[-0.02em] uppercase">
              FILA<span className="text-accent-main">.</span>
            </h1>
            <div className="bg-[#0d2e1a] border-[0.5px] border-accent-main/20 rounded-[20px] px-[11px] py-[4px] flex items-center gap-1.5">
              <div className="w-[6px] h-[6px] rounded-full bg-accent-main animate-custom-pulse" />
              <span className="text-[9px] font-medium text-accent-main tracking-[0.1em] uppercase">LIVE</span>
            </div>
          </div>
          <p className="text-[11px] text-[#333] leading-[1.5] max-width-[480px] font-medium uppercase tracking-wide">
            Gestão inteligente da lista de espera. Monitore o fluxo de entrada e otimize o tempo de resposta da equipe em tempo real.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent-main text-black px-[18px] py-[10px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:opacity-90 active:scale-95 shrink-0"
        >
          <Plus size={14} weight="bold" />
          Novo Registro
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { label: 'NA FILA', value: stats.waiting, icon: ListBullets, desc: 'Aguardando atendimento' },
          { label: 'NOTIFICADO', value: stats.notified, icon: Bell, desc: 'Avisado por mensagem' },
          { label: 'CONFIRMADO', value: stats.confirmed, icon: CheckCircle, desc: 'Presença confirmada' },
          { label: 'VAGAS', value: stats.openSlots, icon: Calendar, desc: 'Slots disponíveis hoje' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px] px-[18px] flex flex-col justify-between h-[110px]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-medium text-[#383838] tracking-[0.12em] uppercase">{kpi.label}</span>
              <kpi.icon size={14} weight="regular" className="text-accent-main opacity-35" />
            </div>
            <div className="space-y-1">
              <div className="text-[26px] text-text-primary font-medium leading-none">
                {kpi.value}
              </div>
              <p className="text-[8px] text-[#2a2a2a] tracking-[0.07em] font-medium uppercase">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Queue List */}
      {entries.length === 0 ? (
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[10px] p-[56px] px-[24px] flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="w-[60px] h-[60px] bg-[#161616] border-[0.5px] border-border-main rounded-full flex items-center justify-center mb-6">
            <ListBullets size={24} className="text-[#2a2a2a]" />
          </div>
          <h3 className="text-[14px] font-medium text-text-secondary mb-2 uppercase tracking-tight">Fila vazia</h3>
          <p className="text-[11px] text-[#2e2e2e] text-center leading-[1.6] max-w-[280px] mb-[22px] font-medium uppercase">
            Nenhum cliente na fila de espera. Adicione clientes quando não houver horários disponíveis.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-[18px] py-[9px] rounded-[7px] border-[0.5px] border-border-main text-[10px] font-medium text-[#444] tracking-[0.08em] uppercase transition-all hover:border-[#333] hover:text-text-muted"
          >
            + Adicionar à fila
          </button>
        </div>
      ) : (
        <div className="space-y-2">
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
    </div>
  )
}
