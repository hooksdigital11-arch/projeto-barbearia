'use client'

import { useState, useEffect } from 'react'
import { Plus } from '@phosphor-icons/react'
import type { AppointmentWithRelations, ServiceOption, BarberOption } from '../types'
import { StatusBadge, CancelButton } from './appointment-status'
import { ClientBookingModal } from './client-booking-modal'
import { CalendarX } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ClientAppointmentsPageProps {
  appointments: AppointmentWithRelations[]
  services: ServiceOption[]
  barbers: BarberOption[]
  initialServiceId?: string
}

export function ClientAppointmentsPage({ appointments, services, barbers, initialServiceId }: ClientAppointmentsPageProps) {
  const now = new Date()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Auto-open modal when coming from services page with ?service=
  useEffect(() => {
    if (initialServiceId) setIsModalOpen(true)
  }, [initialServiceId])
  
  const upcoming = appointments.filter(a => 
    new Date(a.start_time) >= now && !['completed', 'cancelled', 'no_show'].includes(a.status)
  )
  
  const past = appointments.filter(a => 
    new Date(a.start_time) < now || ['completed', 'cancelled', 'no_show'].includes(a.status)
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ClientBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        services={services}
        barbers={barbers}
        initialServiceId={initialServiceId}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[9px] font-medium text-text-muted/65 uppercase tracking-[0.14em] mb-[6px]">MEUS SERVIÇOS</p>
          <h1 className="text-[28px] font-medium text-[#fff] tracking-[-0.01em] uppercase leading-none">
            Meus Agendamentos
          </h1>
          <p className="text-[11px] text-text-muted/70 mt-[5px] uppercase tracking-wider font-medium">
            Acompanhe seu histórico e próximos horários.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-[16px] py-[10px] min-h-[44px] bg-accent-main text-black text-[10px] font-medium uppercase tracking-[0.08em] rounded-[8px] hover:brightness-110 transition-all shrink-0 w-full sm:w-auto"
        >
          <Plus size={13} weight="bold" />
          Novo Agendamento
        </button>
      </div>

      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] min-h-[320px] flex flex-col">
        {upcoming.length === 0 && past.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
            <CalendarX className="w-8 h-8 text-text-muted/30" />
            <p className="text-[14px] font-medium text-text-muted/60 uppercase tracking-wider">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="p-4 space-y-8">
            {upcoming.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] font-medium text-text-muted/60 uppercase tracking-[0.1em] px-1">Próximos Agendamentos</p>
                <div className="grid gap-[6px]">
                  {upcoming.map(appt => (
                    <ClientAppointmentCard key={appt.id} appt={appt} />
                  ))}
                </div>
              </div>
            )}
            
            {past.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] font-medium text-text-muted/60 uppercase tracking-[0.1em] px-1 mt-6">Histórico Recente</p>
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
        <div className="text-[10px] text-text-muted/70 flex items-center gap-2 uppercase tracking-wide">
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
