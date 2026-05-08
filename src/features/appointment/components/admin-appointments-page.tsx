'use client'

import dynamic from 'next/dynamic'
import { useState, useTransition, useDeferredValue } from 'react'
import type { AppointmentWithRelations, ServiceOption, BarberOption, ClientOption, AppointmentStats } from '../types'
import { STATUS_CONFIG } from '../types'
import { StatusBadge, QuickStatusButton, CancelButton } from './appointment-status'
import { KPICard } from '@/components/shared/kpi-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'
import {
  Calendar,
  Plus,
  MagnifyingGlass as Search,
  Clock,
  CheckCircle,
  XCircle,
  TrendUp as TrendingUp,
  Users,
  CircleNotch, 
  CaretRight
} from '@phosphor-icons/react'
import { useRouter, usePathname } from 'next/navigation'

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
    <div className={cn('space-y-16 animate-in fade-in duration-1000', isTransitioning && 'opacity-60')}>
      {/* Header com Design Assimétrico */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-12 bg-accent-cyan rounded-full shadow-[0_0_30px_rgba(0,229,255,0.4)]" />
            <h1 className="text-5xl md:text-7xl font-black font-syne text-white tracking-tighter leading-none uppercase">
              Agenda<span className="text-accent-cyan">.</span>
            </h1>
          </div>
          <p className="text-text-secondary text-lg font-medium max-w-xl ml-7 border-l border-white/10 pl-6">
            Gestão inteligente de horários e produtividade da unidade. Controle cada slot de atendimento com precisão máxima.
          </p>
        </div>

        <Button
          variant="cyan"
          size="lg"
          className="gap-4 px-8 py-7 rounded-[2rem] font-black text-xs uppercase tracking-widest bg-white text-black hover:bg-accent-cyan transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-accent-cyan/20 active:scale-95 group ml-7 lg:ml-0"
          onClick={() => { setEditingAppointment(null); setIsModalOpen(true) }}
        >
          <Plus size={22} weight="bold" className="group-hover:rotate-90 transition-transform duration-500" />
          Novo Registro
        </Button>
      </div>

      {/* KPI Cards com Design Pro Max */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { title: 'Total Hoje', value: stats.total, icon: Calendar, color: '#8b5cf6', desc: 'Agendamentos do dia' },
          { title: 'Confirmados', value: stats.confirmed, icon: CheckCircle, color: '#3b82f6', desc: 'Aguardando atendimento' },
          { title: 'Concluídos', value: stats.completed, icon: TrendingUp, color: '#10b981', desc: 'Finalizados com sucesso' },
          { title: 'Receita', value: `R$ ${(stats.revenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, icon: TrendingUp, color: '#00e5ff', desc: 'Volume financeiro' }
        ].map((item, idx) => (
          <div key={idx} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-white/[0.03] border border-white/10 group-hover:scale-110 transition-transform">
                <item.icon size={24} weight="duotone" style={{ color: item.color }} />
              </div>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{item.title}</h4>
              <p className="text-4xl font-bold text-white tabular-nums tracking-tighter">{item.value}</p>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest opacity-50">{item.desc}</p>
            </div>
            <div className="absolute -bottom-2 -right-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <item.icon size={80} weight="duotone" />
            </div>
          </div>
        ))}
      </div>

      {/* List Card Container */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent-cyan/10 to-accent-blue/10 rounded-[2.5rem] blur-xl opacity-50 transition-opacity" />
        <div className="relative glass-card overflow-hidden">
          {/* Toolbar */}
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.01]">
            <div className="glass p-1 rounded-2xl w-fit flex items-center gap-1 border-white/5 shadow-inner">
              {PERIODS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => changePeriod(id)}
                  className={cn(
                    'px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 active:scale-95',
                    period === id
                      ? 'bg-white text-black shadow-lg'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            
            <div className="relative flex-1 md:max-w-md group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/search:text-accent-cyan transition-colors" />
              <input
                placeholder="Buscar por cliente, barbeiro ou serviço..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="glass-input w-full pl-12 h-12 text-sm font-medium"
              />
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {isTransitioning ? (
              <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-text-secondary">
                <CircleNotch size={40} className="animate-spin text-accent-cyan" />
                <span className="text-sm font-black uppercase tracking-widest opacity-50">Atualizando agenda...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-text-secondary opacity-30">
                <Calendar size={64} weight="thin" className="mb-6" />
                <p className="text-xl font-bold font-syne uppercase tracking-tight">Nenhum agendamento encontrado</p>
                <p className="text-sm mt-2">Ajuste o período ou realize um novo registro.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filtered.map(appt => {
                  const barberColor = getBarberColor(appt.barber_id)
                  const startDt = new Date(appt.start_time)
                  const canEdit = !['completed', 'cancelled', 'no_show'].includes(appt.status)

                  return (
                    <div key={appt.id} className="flex flex-col md:flex-row md:items-center gap-6 px-8 py-8 hover:bg-white/[0.03] transition-all duration-500 group/row">
                      {/* Barber color indicator & Time */}
                      <div className="flex items-center gap-6 md:w-32 shrink-0">
                        <div
                          className="w-1.5 h-12 rounded-full shadow-lg transition-transform duration-500 group-hover/row:scale-y-125"
                          style={{ backgroundColor: barberColor, boxShadow: `0 0 15px ${barberColor}40` }}
                        />
                        <div className="flex flex-col">
                          <p className="text-xl font-black text-white tracking-tighter leading-none">
                            {startDt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1">
                            {startDt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Client & Service */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-bold text-white truncate group-hover/row:text-glow transition-all">{appt.client.full_name}</p>
                          <div className="hidden sm:block">
                            <StatusBadge status={appt.status} appointmentId={appt.id} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-bold text-accent-cyan bg-accent-cyan/5 px-2 py-0.5 rounded-md border border-accent-cyan/10">
                            {appt.service.name}
                          </span>
                          <span className="text-xs text-text-secondary opacity-60 flex items-center gap-1">
                            <Clock size={12} weight="bold" /> {appt.duration_minutes}min
                          </span>
                        </div>
                      </div>

                      {/* Barber Info */}
                      <div className="hidden lg:flex flex-col items-end w-40 shrink-0 pr-6 border-r border-white/5">
                        <p className="text-sm font-bold text-white text-right leading-tight">{appt.barber.full_name}</p>
                        <p className="text-xs font-mono text-text-secondary mt-1">
                          R$ {(appt.price_cents / 100).toFixed(2)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-3 shrink-0">
                        <div className="flex items-center gap-2 opacity-40 group-hover/row:opacity-100 transition-all duration-300">
                          <QuickStatusButton status={appt.status} appointmentId={appt.id} />
                          {canEdit && (
                            <button
                              onClick={() => { setEditingAppointment(appt); setIsModalOpen(true) }}
                              className="tap-target glass rounded-xl text-text-secondary hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                              title="Editar Detalhes"
                            >
                              <CaretRight size={20} weight="bold" />
                            </button>
                          )}
                          {canEdit && <CancelButton appointmentId={appt.id} />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
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
