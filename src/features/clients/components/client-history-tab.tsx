'use client'

import { cn } from '@/lib/utils/cn'
import { Calendar, Clock, User, CurrencyDollar } from '@phosphor-icons/react'
import type { AppointmentRecord } from '../types'

interface ClientHistoryTabProps {
  appointments: AppointmentRecord[]
  showFinancials: boolean
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
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

/** Cores dos barbeiros */
const BARBER_COLORS: Record<string, string> = {
  rafael: '#3b82f6',
  thiago: '#f59e0b',
  marcos: '#10b981',
}

function getBarberColor(name: string): string {
  const key = name.toLowerCase().split(' ')[0] ?? ''
  return BARBER_COLORS[key] || '#6b7280'
}

export function ClientHistoryTab({ appointments, showFinancials }: ClientHistoryTabProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border-[0.5px] border-dashed border-border-main rounded-[10px] bg-bg-sidebar">
        <Calendar size={32} weight="regular" className="text-[#2a2a2a] mb-4" />
        <p className="text-[11px] font-medium text-[#333] uppercase tracking-wider">Nenhum agendamento anterior</p>
      </div>
    )
  }

  return (
    <div className="space-y-[4px]">
      {appointments.map(apt => (
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
                  style={{ backgroundcolor: 'var(--accent, #00d4aa)' }}
                />
                <span className="text-[10px] text-[#333] font-medium uppercase truncate">
                  {apt.barber.full_name}
                </span>
              </div>
            )}
          </div>

          {/* Column 3: Metrics */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-[#2e2e2e] shrink-0">
              <Clock size={12} weight="regular" />
              <span className="text-[10px] font-medium">
                {apt.service?.duration_minutes || '--'}MIN
              </span>
            </div>
            
            <div className="min-w-[70px] text-right">
              <span className="text-[13px] font-medium text-text-secondary tracking-tight">
                {showFinancials && apt.price_cents !== null ? formatCurrency(apt.price_cents) : '---'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
