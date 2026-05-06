'use client'

import { useState } from 'react'
import type { AppointmentWithRelations, ServiceOption, BarberOption, ClientOption, AppointmentStats } from '../types'
import { STATUS_CONFIG } from '../types'
import { AppointmentModal } from './appointment-modal'
import { StatusBadge, QuickStatusButton, CancelButton } from './appointment-status'
import { KPICard } from '@/components/shared/kpi-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'
import {
  Calendar,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  ChevronRight,
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'

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

  const filtered = appointments.filter(a =>
    a.client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.barber.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.service.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const PERIODS: { id: Period; label: string }[] = [
    { id: 'today', label: 'HOJE' },
    { id: 'week', label: 'SEMANA' },
    { id: 'month', label: 'MÊS' },
  ]

  return (
    <div className={cn('space-y-8 transition-opacity duration-300', isTransitioning && 'opacity-60')}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-accent-cyan uppercase tracking-[0.2em] mb-2">AGENDA</p>
          <h1 className="text-3xl md:text-4xl font-bold font-syne text-white uppercase tracking-tight leading-none">
            Agendamentos
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Gerencie todos os agendamentos da barbearia.
          </p>
        </div>
        <Button
          variant="cyan"
          className="h-11 px-6 font-bold uppercase tracking-wider gap-2 shrink-0"
          onClick={() => { setEditingAppointment(null); setIsModalOpen(true) }}
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Hoje"
          value={stats.total.toString()}
          icon={<Calendar className="w-5 h-5" />}
          subtitle="Agendamentos do dia"
        />
        <KPICard
          title="Confirmados"
          value={stats.confirmed.toString()}
          icon={<CheckCircle className="w-5 h-5" />}
          subtitle="Agendados ou confirmados"
        />
        <KPICard
          title="Concluídos"
          value={stats.completed.toString()}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="Finalizados hoje"
        />
        <KPICard
          title="Receita"
          value={`R$ ${(stats.revenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="Dos concluídos hoje"
        />
      </div>

      {/* List Card */}
      <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
            {PERIODS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => changePeriod(id)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200',
                  period === id
                    ? 'bg-accent-cyan text-black shadow-lg shadow-accent-cyan/20'
                    : 'text-muted-foreground hover:text-white'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente, barbeiro ou serviço..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 h-9 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        {isTransitioning ? (
          <div className="flex items-center justify-center h-48 gap-3 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Calendar className="w-10 h-10 opacity-20 mb-4" />
            <p className="font-medium">Nenhum agendamento encontrado</p>
            <p className="text-sm opacity-60 mt-1">Tente outro período ou crie um novo agendamento.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(appt => {
              const barberColor = getBarberColor(appt.barber_id)
              const startDt = new Date(appt.start_time)
              const canEdit = !['completed', 'cancelled', 'no_show'].includes(appt.status)

              return (
                <div key={appt.id} className="flex items-center gap-4 px-4 md:px-6 py-4 hover:bg-white/3 transition-colors group">
                  {/* Barber color indicator */}
                  <div
                    className="w-1 h-12 rounded-full shrink-0"
                    style={{ backgroundColor: barberColor }}
                  />

                  {/* Time */}
                  <div className="w-16 shrink-0 text-center">
                    <p className="text-sm font-bold text-white">
                      {startDt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {startDt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>

                  {/* Client */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{appt.client.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {appt.service.name} · {appt.duration_minutes}min
                    </p>
                  </div>

                  {/* Barber */}
                  <div className="hidden md:block w-28 shrink-0">
                    <p className="text-xs font-medium text-white truncate">{appt.barber.full_name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      R$ {(appt.price_cents / 100).toFixed(2)}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="hidden sm:block shrink-0">
                    <StatusBadge status={appt.status} appointmentId={appt.id} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <QuickStatusButton status={appt.status} appointmentId={appt.id} />
                    {canEdit && (
                      <button
                        onClick={() => { setEditingAppointment(appt); setIsModalOpen(true) }}
                        className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                      >
                        Editar
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
