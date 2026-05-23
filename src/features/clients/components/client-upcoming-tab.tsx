'use client'

import { cn } from '@/lib/utils/cn'
import { Calendar } from '@phosphor-icons/react'
import type { AppointmentRecord } from '../types'

interface ClientUpcomingTabProps {
  appointments: AppointmentRecord[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  confirmed: { label: 'CONFIRMADO', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  pending: { label: 'PENDENTE', color: 'text-yellow-400', dot: 'bg-yellow-400' },
  scheduled: { label: 'AGENDADO', color: 'text-blue-400', dot: 'bg-blue-400' },
}

export function ClientUpcomingTab({ appointments }: ClientUpcomingTabProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border-[0.5px] border-dashed border-border-main rounded-[10px] bg-bg-sidebar">
        <Calendar size={32} weight="regular" className="text-[#2a2a2a] mb-4" />
        <p className="text-[11px] font-medium text-[#333] uppercase tracking-wider">Nenhum agendamento futuro</p>
      </div>
    )
  }

  return (
    <div className="space-y-[4px]">
      {appointments.map(apt => {
        const config = statusConfig[apt.status] ?? { label: 'AGENDADO', color: 'text-blue-400', dot: 'bg-blue-400' }

        return (
          <div
            key={apt.id}
            className="grid grid-cols-[90px_1fr_auto] gap-[16px] py-[13px] px-[18px] items-center bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] group hover:bg-bg-surface hover:border-[#222] transition-all"
          >
            {/* Column 1: Date/Time */}
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-text-secondary tracking-tight">
                {formatDate(apt.start_time)}
              </span>
              <span className="text-[10px] text-[#333] font-medium">
                {formatTime(apt.start_time)}
              </span>
            </div>

            {/* Column 2: Info */}
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-medium text-text-secondary truncate uppercase tracking-[0.02em]">
                {apt.service?.name || 'SERVIÇO'}
              </span>
              {apt.barber && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div 
                    className="w-[5px] h-[5px] rounded-full opacity-50" 
                    style={{ backgroundColor: 'var(--accent, #00d4aa)' }}
                  />
                  <span className="text-[10px] text-[#333] font-medium uppercase truncate">
                    {apt.barber.full_name}
                  </span>
                </div>
              )}
            </div>

            {/* Column 3: Status */}
            <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.02] border-[0.5px] border-white/5 rounded-[6px]">
              <div className={cn("w-[4px] h-[4px] rounded-full", config.dot)} />
              <span className={cn("text-[9px] font-medium uppercase tracking-[0.05em]", config.color)}>
                {config.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
