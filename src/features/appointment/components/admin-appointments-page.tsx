'use client'

import dynamic from 'next/dynamic'
import { useState, useTransition, useDeferredValue } from 'react'
import type { AppointmentWithRelations, ServiceOption, BarberOption, ClientOption, AppointmentStats } from '../types'
import { StatusBadge, QuickStatusButton, ConfirmationStageBadge } from './appointment-status'
import { cn } from '@/lib/utils/cn'
import {
  Plus,
  MagnifyingGlass as Search,
  CircleNotch,
  ArrowRight
} from '@phosphor-icons/react'
import { useRouter, usePathname } from 'next/navigation'

const AppointmentModal = dynamic(() => import('./appointment-modal').then(m => m.AppointmentModal), { ssr: false })

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

  const filtered = appointments.filter(a => {
    const q = deferredSearch.toLowerCase()
    return (
      a.client?.full_name?.toLowerCase().includes(q) ||
      a.barber?.full_name?.toLowerCase().includes(q) ||
      a.service?.name?.toLowerCase().includes(q)
    )
  })

  const PERIODS: { id: Period; label: string }[] = [
    { id: 'today', label: 'HOJE' },
    { id: 'week', label: 'SEMANA' },
    { id: 'month', label: 'MÊS' },
  ]

  return (
    <div className={cn('space-y-12 py-8 animate-premium-in', isTransitioning && 'opacity-60')}>
      {/* Minimalist Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-[36px] font-medium font-syne text-text-primary tracking-[-0.02em] uppercase leading-none">
            Agenda<span className="text-accent-main">.</span>
          </h1>
          <p className="text-[12px] text-text-secondary font-medium tracking-tight">Controle de fluxo operacional</p>
        </div>

        <button
          className="bg-accent-main text-black px-5 py-2.5 rounded-[8px] transition-all hover:opacity-90 active:scale-[0.98]"
          onClick={() => { setEditingAppointment(null); setIsModalOpen(true) }}
        >
          <div className="flex items-center gap-2">
            <Plus size={14} weight="regular" />
            <span className="tracking-[0.08em] text-[11px] font-medium uppercase">Novo Agendamento</span>
          </div>
        </button>
      </div>

      {/* KPI Cards - Minimalist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[10px]">
        {[
          { title: 'TOTAL HOJE', value: stats.total, unit: '' },
          { title: 'CONFIRMADOS', value: stats.confirmed, unit: '' },
          { title: 'CONCLUÍDOS', value: stats.completed, unit: '' },
          { title: 'RECEITA', value: stats.revenue / 100, unit: 'R$' }
        ].map((item, idx) => (
          <div key={idx} className="bg-bg-surface border-[0.5px] border-border-main rounded-[10px] p-[18px] px-[20px] flex flex-col justify-between h-[110px]">
            <p className="text-[10px] tracking-[0.1em] text-[#444] font-medium uppercase">{item.title}</p>
            <div className="flex items-baseline gap-1">
              {item.unit && <span className="text-[13px] text-text-nav font-medium">{item.unit}</span>}
              <span className="text-[26px] font-medium text-text-primary tracking-tight">
                {typeof item.value === 'number' ? item.value.toLocaleString('pt-BR') : item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="bg-bg-surface border-[0.5px] border-border-main rounded-[8px] p-[3px] flex items-center w-fit">
          {PERIODS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => changePeriod(id)}
              className={cn(
                'px-5 py-2 rounded-[6px] text-[10px] font-medium uppercase tracking-[0.08em] transition-all',
                period === id
                  ? 'bg-[#1e1e1e] text-text-primary'
                  : 'text-text-nav hover:text-text-muted'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        
        <div className="relative flex-1 md:max-w-[240px] group">
          <div className="bg-bg-surface border-[0.5px] border-border-main rounded-[8px] flex items-center px-3 h-[36px] transition-all focus-within:border-[#2a2a2a]">
            <Search className="w-3.5 h-3.5 text-[#444]" />
            <input
              placeholder="PESQUISAR..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none w-full pl-2 text-[10px] font-medium uppercase tracking-[0.1em] outline-none placeholder:text-[#333] text-text-primary"
            />
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="min-h-[400px]">
        {isTransitioning ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-text-muted">
            <CircleNotch size={24} className="animate-spin text-accent-main" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-start py-20">
            <p className="text-2xl font-medium text-[#222] tracking-tight uppercase">Nenhum registro</p>
          </div>
        ) : (
          <div className="space-y-[2px]">
            {filtered.map(appt => {
              const startDt = new Date(appt.start_time)
              const canEdit = !['completed', 'cancelled', 'no_show'].includes(appt.status)

              return (
                <div
                  key={appt.id}
                  className="bg-bg-surface border-[0.5px] border-border-main rounded-[10px] p-[14px] px-[16px] md:px-[20px] group hover:border-[#2a2a2a] transition-all"
                >
                  {/* Mobile layout */}
                  <div className="flex lg:hidden flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[18px] font-medium text-text-primary tracking-tight leading-none">
                          {startDt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[9px] text-[#444] font-medium uppercase tracking-wider">
                          {startDt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                      <StatusBadge status={appt.status} appointmentId={appt.id} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[13px] font-medium text-text-primary uppercase tracking-tight truncate">
                            {appt.client.full_name}
                          </span>
                          <ConfirmationStageBadge stage={appt.confirmacao_etapa} />
                        </div>
                        <span className="text-[10px] font-medium text-[#444] uppercase tracking-wider truncate">
                          {appt.service.name} · {appt.duration_minutes} MIN · Com {appt.barber?.full_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <QuickStatusButton status={appt.status} appointmentId={appt.id} clientId={appt.client_id} role="admin" />
                        {canEdit && (
                          <button
                            onClick={() => { setEditingAppointment(appt); setIsModalOpen(true) }}
                            className="text-[#444] hover:text-text-primary transition-colors"
                            title="Editar"
                          >
                            <ArrowRight size={16} weight="regular" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden lg:flex items-center gap-6">
                    <div className="flex flex-col min-w-[70px]">
                      <span className="text-[20px] font-medium text-text-primary tracking-tight leading-none">
                        {startDt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[9px] text-[#444] font-medium uppercase tracking-wider mt-1">
                        {startDt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>

                    <div className="w-[1px] h-[36px] bg-accent-main opacity-40" />

                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[14px] font-medium text-text-primary uppercase tracking-tight truncate">
                          {appt.client.full_name}
                        </span>
                        <ConfirmationStageBadge stage={appt.confirmacao_etapa} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-medium text-[#444] uppercase tracking-wider">
                          {appt.service.name}
                        </span>
                        <span className="text-[9px] text-[#333] font-medium uppercase">
                          {appt.duration_minutes} MIN
                        </span>
                        <span className="text-[9px] text-[#666] font-medium uppercase tracking-wider">
                          · Com {appt.barber?.full_name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <QuickStatusButton status={appt.status} appointmentId={appt.id} clientId={appt.client_id} role="admin" />
                        {canEdit && (
                          <button
                            onClick={() => { setEditingAppointment(appt); setIsModalOpen(true) }}
                            className="text-[#444] hover:text-text-primary transition-colors"
                            title="Editar"
                          >
                            <ArrowRight size={16} weight="regular" />
                          </button>
                        )}
                      </div>
                      <div className="min-w-[100px] flex justify-end">
                        <StatusBadge status={appt.status} appointmentId={appt.id} />
                      </div>
                    </div>
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
