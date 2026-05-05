import { cn } from '@/lib/utils/cn'
import { Calendar, Clock, User, CurrencyDollar } from '@phosphor-icons/react/dist/ssr'
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
      <div className="text-center py-12">
        <Calendar size={40} weight="duotone" className="mx-auto text-text-secondary mb-3" />
        <p className="text-text-secondary text-sm">Nenhum agendamento anterior encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {appointments.map(apt => (
        <div
          key={apt.id}
          className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors"
        >
          {/* Date */}
          <div className="flex-shrink-0 w-14 text-center">
            <p className="text-sm font-bold text-white">{formatDate(apt.start_time)}</p>
            <p className="text-xs text-text-secondary">{formatTime(apt.start_time)}</p>
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-white/10 flex-shrink-0" />

          {/* Service */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {apt.service?.name || 'Serviço'}
            </p>
            {apt.barber && (
              <p className="text-xs text-text-secondary flex items-center gap-1.5 mt-0.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getBarberColor(apt.barber.full_name) }}
                />
                {apt.barber.full_name}
              </p>
            )}
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1 text-text-secondary flex-shrink-0">
            <Clock size={12} weight="duotone" />
            <span className="text-xs">{apt.service?.duration_minutes || '--'}min</span>
          </div>

          {/* Price */}
          {showFinancials && apt.price_cents !== null && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-sm font-bold text-accent-cyan">
                {formatCurrency(apt.price_cents)}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
