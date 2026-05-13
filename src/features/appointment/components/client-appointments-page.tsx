'use client'

import type { AppointmentWithRelations } from '../types'
import { StatusBadge, CancelButton } from './appointment-status'
import { CalendarX } from 'lucide-react'
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
      <div className="space-y-1">
        <p className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.14em] mb-[6px]">MEUS SERVIÇOS</p>
        <h1 className="text-[28px] font-medium text-[#fff] tracking-[-0.01em] uppercase leading-none">
          Meus Agendamentos
        </h1>
        <p className="text-[11px] text-[#333] mt-[5px] uppercase tracking-wider font-medium">
          Acompanhe seu histórico e próximos horários.
        </p>
      </div>

      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] min-h-[320px] flex flex-col">
        {upcoming.length === 0 && past.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
            <CalendarX className="w-8 h-8 text-[#1e1e1e]" />
            <p className="text-[14px] font-medium text-[#333] uppercase tracking-wider">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="p-4 space-y-8">
            {upcoming.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] font-medium text-[#333] uppercase tracking-[0.1em] px-1">Próximos Agendamentos</p>
                <div className="grid gap-[6px]">
                  {upcoming.map(appt => (
                    <ClientAppointmentCard key={appt.id} appt={appt} />
                  ))}
                </div>
              </div>
            )}
            
            {past.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] font-medium text-[#333] uppercase tracking-[0.1em] px-1 mt-6">Histórico Recente</p>
                <div className="grid gap-[6px]">
                  {past.map(appt => (
                    <ClientAppointmentCard key={appt.id} appt={appt} dimmed />
                  ))}
                </div>
              </div>
            )}
          </div>
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
      "p-4 rounded-[8px] border border-[#1a1a1a] bg-[#0d0d0d] flex flex-col md:flex-row md:items-center gap-4 transition-all hover:bg-[#111]",
      dimmed && "opacity-40"
    )}>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <p className="text-[13px] font-medium text-[#fff] uppercase tracking-tight leading-none">{appt.service.name}</p>
          <StatusBadge status={appt.status} appointmentId={appt.id} />
        </div>
        <div className="text-[10px] text-[#333] flex items-center gap-2 uppercase tracking-wide">
          <span>{startDt.toLocaleDateString('pt-BR')} às {startDt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="opacity-30">·</span>
          <span className="text-[#bbb] font-medium">COM {appt.barber.full_name}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0">
        <p className="text-[14px] font-medium text-[#fff] tracking-tight">R$ {(appt.price_cents / 100).toFixed(0)}</p>
        {canCancel && <CancelButton appointmentId={appt.id} />}
      </div>
    </div>
  )
}
