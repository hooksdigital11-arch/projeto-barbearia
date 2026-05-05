import { cn } from '@/lib/utils/cn'
import { Calendar, Clock, User } from '@phosphor-icons/react/dist/ssr'
import type { AppointmentRecord } from '../types'

interface ClientUpcomingTabProps {
  appointments: AppointmentRecord[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusConfig: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmado', color: 'bg-emerald-500/10 text-emerald-400' },
  pending: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-400' },
  scheduled: { label: 'Agendado', color: 'bg-blue-500/10 text-blue-400' },
}

export function ClientUpcomingTab({ appointments }: ClientUpcomingTabProps) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={40} weight="duotone" className="mx-auto text-text-secondary mb-3" />
        <p className="text-text-secondary text-sm">Nenhum agendamento futuro</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {appointments.map(apt => {
        const config = statusConfig[apt.status] ?? { label: 'Agendado', color: 'bg-blue-500/10 text-blue-400' }

        return (
          <div
            key={apt.id}
            className="p-5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent-cyan/10">
                  <Calendar size={18} weight="duotone" className="text-accent-cyan" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{formatDate(apt.start_time)}</p>
                  <p className="text-xs text-text-secondary flex items-center gap-1">
                    <Clock size={10} weight="duotone" />
                    {formatTime(apt.start_time)}
                  </p>
                </div>
              </div>
              <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-md', config.color)}>
                {config.label}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                ✂️ {apt.service?.name || 'Serviço'}
              </span>
              {apt.barber && (
                <span className="flex items-center gap-1.5">
                  <User size={12} weight="duotone" />
                  {apt.barber.full_name}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
