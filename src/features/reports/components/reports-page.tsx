'use client'

import dynamic from 'next/dynamic'
import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PeriodSelector } from './period-selector'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { CircleNotch } from '@phosphor-icons/react'
import { PageTitle } from '@/components/shared/page-title'
import type { 
  RevenueReport, 
  AppointmentReport, 
  ClientReport, 
  TeamReport,
  LoyaltyReport,
  ReportPeriod 
} from '../types'

const RevenueSection = dynamic(() => import('./revenue-section').then(m => m.RevenueSection), { ssr: false })
const AppointmentsSection = dynamic(() => import('./appointments-section').then(m => m.AppointmentsSection), { ssr: false })
const ClientsSection = dynamic(() => import('./clients-section').then(m => m.ClientsSection), { ssr: false })
const TeamSection = dynamic(() => import('./team-section').then(m => m.TeamSection), { ssr: false })
const LoyaltySection = dynamic(() => import('./loyalty-section').then(m => m.LoyaltySection), { ssr: false })
const ExportButton = dynamic(() => import('./export-button').then(m => m.ExportButton), { ssr: false })

interface ReportsPageProps {
  initialRevenue: RevenueReport
  initialAppointments: AppointmentReport
  initialClients: ClientReport
  initialTeam: TeamReport
  initialLoyalty: LoyaltyReport
  organizationId: string
}

export function ReportsPage({ 
  initialRevenue, 
  initialAppointments, 
  initialClients, 
  initialTeam,
  initialLoyalty,
  organizationId
}: ReportsPageProps) {
  const router = useRouter()
  const [dates, setDates] = useState({ 
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
    end: new Date().toISOString()
  })
  const [revenue, setRevenue] = useState(initialRevenue)
  const [appointments, setAppointments] = useState(initialAppointments)
  const [clients, setClients] = useState(initialClients)
  const [team, setTeam] = useState(initialTeam)
  const [loyalty, setLoyalty] = useState(initialLoyalty)
  const [isPending, startTransition] = useTransition()

  // Sincroniza o estado local com as novas props do server pós-refresh
  useEffect(() => {
    setRevenue(initialRevenue)
    setAppointments(initialAppointments)
    setClients(initialClients)
    setTeam(initialTeam)
    setLoyalty(initialLoyalty)
  }, [initialRevenue, initialAppointments, initialClients, initialTeam, initialLoyalty])

  // Realtime setup
  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase.channel('reports-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'services', filter: `organization_id=eq.${organizationId}` },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `organization_id=eq.${organizationId}` },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comanda_items', filter: `organization_id=eq.${organizationId}` },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients', filter: `organization_id=eq.${organizationId}` },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loyalty_stamps', filter: `organization_id=eq.${organizationId}` },
        () => router.refresh()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [organizationId, router])

  const handlePeriodChange = (start: string, end: string, period: ReportPeriod) => {
    startTransition(() => {
      setDates({ start, end })
      
      const params = new URLSearchParams()
      params.set('start', start)
      params.set('end', end)
      params.set('period', period)
      
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }
  return (
    <div className="relative min-h-screen pb-32">
      <div className="space-y-24">
        {/* Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <PageTitle 
            title="Insights" 
            subtitle="Inteligência de dados para uma gestão de alto nível. Analise cada detalhe da sua performance e tome decisões baseadas em fatos." 
            className="mb-0" 
          />
          <div className="flex items-center gap-4">
            <ExportButton 
              kpis={revenue.kpis as any}
              chartData={revenue.chartData as any}
              paymentMethods={revenue.paymentMethods as any}
              barberPerformance={(revenue as any).barberPerformance || []}
              period={`${new Date(dates.start).toLocaleDateString('pt-BR')} — ${new Date(dates.end).toLocaleDateString('pt-BR')}`}
            />
          </div>
        </div>

        {/* Seletor de Período */}
        <div className="relative z-20">
          <PeriodSelector onPeriodChange={handlePeriodChange} />
        </div>

        {isPending ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-8">
            <div className="w-1.5 h-12 bg-accent-cyan animate-pulse" />
            <p className="text-[12px] font-black uppercase tracking-[0.5em] text-white/40 animate-pulse">
              Computing Performance Data
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-32">
            <div className="animate-premium-in" style={{ animationDelay: '100ms' }}>
              <RevenueSection data={revenue} />
            </div>
            
            <div className="animate-premium-in" style={{ animationDelay: '200ms' }}>
              <AppointmentsSection data={appointments} />
            </div>

            <div className="animate-premium-in" style={{ animationDelay: '300ms' }}>
              <ClientsSection data={clients} />
            </div>

            <div className="animate-premium-in" style={{ animationDelay: '400ms' }}>
              <TeamSection data={team} />
            </div>

            <div className="animate-premium-in" style={{ animationDelay: '500ms' }}>
              <LoyaltySection data={loyalty} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
