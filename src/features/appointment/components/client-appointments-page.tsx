'use client'

import type { AppointmentWithRelations } from '../types'
import { StatusBadge, CancelButton } from './appointment-status'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ClientAppointmentsPageProps {
  appointments: AppointmentWithRelations[]
}

export function ClientAppointmentsPage({ appointments }: ClientAppointmentsPageProps) {
  const now = new Date()
  
  const upcoming = appointments.filter(a => 
    new Date(a.start_time) >= now && !['completed', 'cancelled', 'no_show'].includes(a.status)
  )
  
  const past = appointments.filter(a => 
    new Date(a.start_time) < now || ['completed', 'cancelled', 'no_show'].includes(a.status)
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <p className="text-xs font-bold text-accent-cyan uppercase tracking-[0.2em] mb-2">MEUS SERVIÇOS</p>
        <h1 className="text-3xl font-bold font-syne text-text-primary uppercase tracking-tight">Meus Agendamentos</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Acompanhe seu histórico e próximos horários.
        </p>
      </div>

      <div className="space-y-8">
        {upcoming.length === 0 && past.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl text-muted-foreground">
            <Calendar className="w-10 h-10 opacity-20 mb-4" />
            <p className="font-medium text-text-primary">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-syne font-bold text-text-primary uppercase tracking-tight">Próximos</h2>
                <div className="grid gap-4">
                  {upcoming.map(appt => (
                    <ClientAppointmentCard key={appt.id} appt={appt} />
                  ))}
                </div>
              </div>
            )}
            
            {past.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-syne font-bold text-text-primary uppercase tracking-tight mt-8">Histórico</h2>
                <div className="grid gap-4">
                  {past.map(appt => (
                    <ClientAppointmentCard key={appt.id} appt={appt} dimmed />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ClientAppointmentCard({ appt, dimmed }: { appt: AppointmentWithRelations, dimmed?: boolean }) {
  const startDt = new Date(appt.start_time)
  const canCancel = !dimmed && !['completed', 'cancelled', 'no_show'].includes(appt.status)

  return (
    <div className={cn(
      "p-5 rounded-2xl border border-white/5 bg-bg-surface flex flex-col md:flex-row md:items-center gap-4 transition-all hover:bg-white/3",
      dimmed && "opacity-60"
    )}>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold font-syne text-text-primary">{appt.service.name}</p>
          <StatusBadge status={appt.status} appointmentId={appt.id} />
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>{startDt.toLocaleDateString('pt-BR')} às {startDt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          <span>·</span>
          <span>{appt.barber.full_name}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0">
        <p className="text-lg font-bold text-text-primary">R$ {(appt.price_cents / 100).toFixed(2)}</p>
        {canCancel && <CancelButton appointmentId={appt.id} />}
      </div>
    </div>
  )
}
