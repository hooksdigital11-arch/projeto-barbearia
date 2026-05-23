'use client'

import { useState } from 'react'
import type { AppointmentWithRelations, ServiceOption, ClientOption } from '../types'
import { AppointmentModal } from './appointment-modal'
import { QuickStatusButton, CancelButton, StatusBadge } from './appointment-status'
import { Plus, CalendarX } from 'lucide-react'
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.14em] mb-[6px]">AGENDA DO DIA</p>
          <h1 className="text-[28px] font-medium text-[#fff] tracking-[-0.01em] uppercase leading-none">
            Meus Agendamentos
          </h1>
          <p className="text-[11px] text-[#333] mt-1 font-medium uppercase tracking-wider">
            {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} hoje
          </p>
        </div>
        <button
          className="bg-accent-main text-black text-[10px] font-medium tracking-[0.1em] p-[10px_18px] rounded-[8px] flex items-center gap-2 hover:brightness-110 transition-all uppercase shrink-0"
          onClick={() => { setEditingAppointment(null); setIsModalOpen(true) }}
        >
          <Plus className="w-3.5 h-3.5" />
          Agendar Cliente
        </button>
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
                <p className="text-xs text-muted-foreground italic mt-1">&quot;{nextAppointment.notes}&quot;</p>
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
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] overflow-hidden min-h-[360px] flex flex-col">
        {upcoming.length === 0 && past.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
            <CalendarX className="w-8 h-8 text-[#1e1e1e]" />
            <div className="text-center space-y-1">
              <p className="text-[14px] font-medium text-[#333] uppercase tracking-wider">Nenhum agendamento hoje</p>
              <p className="text-[11px] text-[#222] uppercase tracking-widest">Clique em &quot;Agendar Cliente&quot; para criar um.</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {upcoming.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-medium text-[#333] uppercase tracking-[0.1em] px-1">
                  PRÓXIMOS AGENDAMENTOS — {upcoming.length}
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
                <p className="text-[10px] font-medium text-[#333] uppercase tracking-[0.1em] px-1 mt-6">
                  HISTÓRICO DO DIA — {past.length}
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
          </div>
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
  const canEdit = !['completed', 'cancelled', 'no_show'].includes(appt.status)

  return (
    <div
      className={cn(
        'group relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-white/5 bg-bg-surface hover:border-white/10 transition-all',
        dimmed && 'opacity-50'
      )}
    >
      {/* Top Section / Main Row: contains time, details, and mobile status */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
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

        {/* Mobile Status Badge */}
        <div className="sm:hidden shrink-0">
          <StatusBadge status={appt.status} appointmentId={appt.id} />
        </div>
      </div>

      {/* Bottom Section: Actions and Desktop Status */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t border-white/5 sm:border-t-0 shrink-0">
        {/* Desktop Status Badge */}
        <div className="hidden sm:block">
          <StatusBadge status={appt.status} appointmentId={appt.id} />
        </div>

        {/* Actions panel: visible by default on mobile, hover-only on sm and up */}
        <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <QuickStatusButton status={appt.status} appointmentId={appt.id} />
          {canEdit && (
            <>
              <button
                onClick={onEdit}
                className="text-[10px] font-bold uppercase px-3 py-1.5 sm:py-1 rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-text-primary transition-colors"
              >
                Editar
              </button>
              <CancelButton appointmentId={appt.id} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
