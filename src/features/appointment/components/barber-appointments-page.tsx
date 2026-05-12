'use client'

import { useState } from 'react'
import type { AppointmentWithRelations, ServiceOption, ClientOption } from '../types'
import { STATUS_CONFIG } from '../types'
import { AppointmentModal } from './appointment-modal'
import { QuickStatusButton, CancelButton, StatusBadge } from './appointment-status'
import { Button } from '@/components/ui/button'
import { Plus, Clock, User, Scissors, ChevronRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface BarberAppointmentsPageProps {
  appointments: AppointmentWithRelations[]
  services: ServiceOption[]
  clients: ClientOption[]
  barberId: string
}

export function BarberAppointmentsPage({
  appointments,
  services,
  clients,
  barberId,
}: BarberAppointmentsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithRelations | null>(null)

  const now = new Date()
  const upcoming = appointments.filter(a =>
    new Date(a.start_time) >= now && !['completed', 'cancelled', 'no_show'].includes(a.status)
  )
  const past = appointments.filter(a =>
    new Date(a.start_time) < now || ['completed', 'cancelled', 'no_show'].includes(a.status)
  )
  const nextAppointment = upcoming[0]
  const inProgress = appointments.find(a => a.status === 'in_progress')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-accent-cyan uppercase tracking-[0.2em] mb-2">AGENDA DO DIA</p>
          <h1 className="text-3xl font-bold font-syne text-text-primary uppercase tracking-tight leading-none">
            Meus Agendamentos
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} hoje
          </p>
        </div>
        <Button
          variant="cyan"
          className="h-11 px-6 font-bold uppercase tracking-wider gap-2 shrink-0"
          onClick={() => { setEditingAppointment(null); setIsModalOpen(true) }}
        >
          <Plus className="w-4 h-4" />
          Agendar Cliente
        </Button>
      </div>

      {/* Em andamento highlight */}
      {inProgress && (
        <div className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-5 md:p-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">EM ANDAMENTO AGORA</p>
              <h2 className="text-xl font-bold text-text-primary font-syne">{inProgress.client.full_name}</h2>
              <p className="text-sm text-muted-foreground">{inProgress.service.name} · {inProgress.duration_minutes}min</p>
            </div>
            <div className="flex flex-col gap-2 items-end shrink-0">
              <StatusBadge status={inProgress.status} appointmentId={inProgress.id} />
              <QuickStatusButton status={inProgress.status} appointmentId={inProgress.id} />
            </div>
          </div>
        </div>
      )}

      {/* Próximo */}
      {nextAppointment && !inProgress && (
        <div className="relative overflow-hidden rounded-2xl border border-accent-cyan/30 bg-accent-cyan/5 p-5 md:p-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan to-blue-500" />
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-accent-cyan uppercase tracking-widest">PRÓXIMO CLIENTE</p>
              <h2 className="text-xl font-bold text-text-primary font-syne">{nextAppointment.client.full_name}</h2>
              <p className="text-sm text-muted-foreground">
                {nextAppointment.service.name} · {new Date(nextAppointment.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {nextAppointment.notes && (
                <p className="text-xs text-muted-foreground italic mt-1">"{nextAppointment.notes}"</p>
              )}
            </div>
            <div className="flex flex-col gap-2 items-end shrink-0">
              <StatusBadge status={nextAppointment.status} appointmentId={nextAppointment.id} />
              <QuickStatusButton status={nextAppointment.status} appointmentId={nextAppointment.id} />
            </div>
          </div>
        </div>
      )}

      {/* Timeline do dia */}
      <div className="space-y-4">
        {upcoming.length === 0 && past.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl text-muted-foreground">
            <Calendar className="w-10 h-10 opacity-20 mb-4" />
            <p className="font-medium text-text-primary">Nenhum agendamento hoje</p>
            <p className="text-sm opacity-60 mt-1">Clique em "Agendar Cliente" para criar um.</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                  Próximos — {upcoming.length}
                </p>
                {upcoming.map(appt => (
                  <AppointmentCard
                    key={appt.id}
                    appt={appt}
                    onEdit={() => { setEditingAppointment(appt); setIsModalOpen(true) }}
                  />
                ))}
              </div>
            )}
            {past.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 mt-6">
                  Anteriores — {past.length}
                </p>
                {past.map(appt => (
                  <AppointmentCard
                    key={appt.id}
                    appt={appt}
                    onEdit={() => { setEditingAppointment(appt); setIsModalOpen(true) }}
                    dimmed
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingAppointment(null) }}
        appointment={editingAppointment}
        services={services}
        barbers={[]}
        clients={clients}
        isAdmin={false}
        defaultBarberId={barberId}
      />
    </div>
  )
}

function AppointmentCard({
  appt,
  onEdit,
  dimmed = false,
}: {
  appt: AppointmentWithRelations
  onEdit: () => void
  dimmed?: boolean
}) {
  const startDt = new Date(appt.start_time)
  const cfg = STATUS_CONFIG[appt.status]
  const canEdit = !['completed', 'cancelled', 'no_show'].includes(appt.status)

  return (
    <div
      className={cn(
        'group relative flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-bg-surface hover:border-white/10 transition-all',
        dimmed && 'opacity-50'
      )}
    >
      {/* Time column */}
      <div className="w-14 shrink-0 text-center">
        <p className="text-sm font-bold text-text-primary">
          {startDt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="text-[10px] text-muted-foreground">{appt.duration_minutes}min</p>
      </div>

      {/* Divider */}
      <div className="w-px h-12 bg-white/10 shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-bold text-text-primary truncate">{appt.client.full_name}</p>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground truncate">{appt.service.name}</p>
          <span className="text-xs font-bold text-text-primary/40">·</span>
          <p className="text-xs font-medium text-text-primary">R$ {(appt.price_cents / 100).toFixed(2)}</p>
        </div>
      </div>

      {/* Status */}
      <StatusBadge status={appt.status} appointmentId={appt.id} />

      {/* Actions (hover) */}
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <QuickStatusButton status={appt.status} appointmentId={appt.id} />
        {canEdit && (
          <>
            <button
              onClick={onEdit}
              className="text-[10px] font-bold uppercase px-3 py-1 rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-text-primary transition-colors"
            >
              Editar
            </button>
            <CancelButton appointmentId={appt.id} />
          </>
        )}
      </div>
    </div>
  )
}
