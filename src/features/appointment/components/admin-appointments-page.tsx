'use client'

import dynamic from 'next/dynamic'
import { useState, useTransition, useDeferredValue } from 'react'
import type { AppointmentWithRelations, ServiceOption, BarberOption, ClientOption, AppointmentStats } from '../types'
import { StatusBadge, QuickStatusButton, CancelButton } from './appointment-status'
import { cn } from '@/lib/utils/cn'
import {
  Plus,
  MagnifyingGlass as Search,
  CircleNotch,
  ArrowRight
} from '@phosphor-icons/react'
import { useRouter, usePathname } from 'next/navigation'
import { PageTitle } from '@/components/shared/page-title'

const AppointmentModal = dynamic(() => import('./appointment-modal').then(m => m.AppointmentModal), { ssr: false })

// Hash de cor por barbeiro
const BARBER_PALETTE = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#00e5ff']
const barberColorCache: Record<string, string> = {}
let colorIndex = 0
function getBarberColor(barberId: string): string {
  if (!barberColorCache[barberId]) {
    barberColorCache[barberId] = BARBER_PALETTE[colorIndex % BARBER_PALETTE.length] ?? '#00e5ff'
    colorIndex++
  }
  return barberColorCache[barberId] ?? '#00e5ff'
}

type Period = 'today' | 'week' | 'month'

interface AdminAppointmentsPageProps {
  appointments: AppointmentWithRelations[]
  stats: AppointmentStats
  services: ServiceOption[]
  barbers: BarberOption[]
  clients: ClientOption[]
  initialPeriod: Period
}

export function AdminAppointmentsPage({
  appointments,
  stats,
  services,
  barbers,
  clients,
  initialPeriod,
}: AdminAppointmentsPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [period, setPeriod] = useState<Period>(initialPeriod)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithRelations | null>(null)
  const [isTransitioning, startTransition] = useTransition()

  const changePeriod = (p: Period) => {
    setPeriod(p)
    startTransition(() => {
      router.push(`${pathname}?period=${p}`)
    })
  }

  const deferredSearch = useDeferredValue(searchTerm)

  const filtered = appointments.filter(a =>
    a.client.full_name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
    a.barber.full_name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
    a.service.name.toLowerCase().includes(deferredSearch.toLowerCase())
  )

  const PERIODS: { id: Period; label: string }[] = [
    { id: 'today', label: 'HOJE' },
    { id: 'week', label: 'SEMANA' },
    { id: 'month', label: 'MÊS' },
  ]

  return (
    <div className={cn('space-y-24 py-12 animate-premium-in', isTransitioning && 'opacity-60')}>
      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        <PageTitle 
          title="Agenda" 
          subtitle="Controle de fluxo operacional" 
          className="mb-0" 
        />

        <button
          className="btn-pill-primary w-fit"
          onClick={() => { setEditingAppointment(null); setIsModalOpen(true) }}
        >
          <div className="flex items-center gap-3">
            <Plus size={20} weight="bold" />
            <span className="uppercase tracking-widest text-[11px]">Novo Agendamento</span>
          </div>
        </button>
      </div>

      {/* KPI Cards - Precision Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 overflow-hidden">
        {[
          { title: 'Total Hoje', value: stats.total, unit: '' },
          { title: 'Confirmados', value: stats.confirmed, unit: '' },
          { title: 'Concluídos', value: stats.completed, unit: '' },
          { title: 'Receita', value: stats.revenue / 100, unit: 'R$' }
        ].map((item, idx) => (
          <div key={idx} className="p-12 bg-black flex flex-col justify-between h-48 group">
            <p className="label-muted opacity-40 group-hover:opacity-100 transition-opacity">{item.title}</p>
            <div className="flex items-baseline gap-2">
              {item.unit && <span className="text-xl font-mono text-text-muted">{item.unit}</span>}
              <span className="text-5xl font-bold font-mono text-white tracking-tighter group-hover:text-accent-cyan transition-colors">
                {typeof item.value === 'number' ? item.value.toLocaleString('pt-BR') : item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar & Search */}
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
          <div className="flex items-center gap-2">
            {PERIODS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => changePeriod(id)}
                className={cn(
                  'px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all',
                  period === id
                    ? 'bg-white text-black'
                    : 'text-text-muted hover:text-white'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          
          <div className="relative flex-1 md:max-w-md group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent-cyan transition-colors" />
            <input
              placeholder="PESQUISAR REGISTROS..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none w-full pl-8 h-10 text-[10px] font-bold uppercase tracking-[0.2em] outline-none placeholder:text-text-muted"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="min-h-[400px]">
          {isTransitioning ? (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-text-muted">
              <CircleNotch size={32} className="animate-spin text-accent-cyan" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-start py-20">
              <p className="heading-section text-text-muted opacity-20">Nenhum registro encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map(appt => {
                const barberColor = getBarberColor(appt.barber_id)
                const startDt = new Date(appt.start_time)
                const canEdit = !['completed', 'cancelled', 'no_show'].includes(appt.status)

                return (
                  <div key={appt.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 py-12 px-4 hover:bg-white/[0.02] transition-colors items-center group">
                    {/* Time Column */}
                    <div className="md:col-span-2 flex flex-col">
                      <span className="text-4xl font-mono font-bold text-white tracking-tighter group-hover:text-accent-cyan transition-colors">
                        {startDt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="label-muted opacity-40 mt-1">
                        {startDt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>

                    {/* Subject Column */}
                    <div className="md:col-span-4 flex flex-col space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: barberColor }} />
                        <span className="text-xl font-bold text-white uppercase tracking-tight">
                          {appt.client.full_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 ml-5">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
                          {appt.service.name}
                        </span>
                        <span className="text-[10px] font-mono text-text-muted opacity-40">
                          {appt.duration_minutes} MIN
                        </span>
                      </div>
                    </div>

                    {/* Status Column */}
                    <div className="md:col-span-3">
                      <StatusBadge status={appt.status} appointmentId={appt.id} />
                    </div>

                    {/* Actions Column */}
                    <div className="md:col-span-3 flex items-center justify-end gap-6 opacity-0 group-hover:opacity-100 transition-all">
                      <QuickStatusButton status={appt.status} appointmentId={appt.id} />
                      {canEdit && (
                        <button
                          onClick={() => { setEditingAppointment(appt); setIsModalOpen(true) }}
                          className="text-text-muted hover:text-white transition-colors"
                          title="Editar"
                        >
                          <ArrowRight size={20} weight="bold" />
                        </button>
                      )}
                      {canEdit && <CancelButton appointmentId={appt.id} />}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingAppointment(null) }}
        appointment={editingAppointment}
        services={services}
        barbers={barbers}
        clients={clients}
        isAdmin
      />
    </div>
  )
}
