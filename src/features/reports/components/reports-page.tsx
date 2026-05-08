'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PeriodSelector } from './period-selector'
import { RevenueSection } from './revenue-section'
import { AppointmentsSection } from './appointments-section'
import { ClientsSection } from './clients-section'
import { TeamSection } from './team-section'
import { LoyaltySection } from './loyalty-section'
import { ExportButton } from './export-button'
import { PageTitle } from '@/components/shared/page-title'
import { createClient } from '@/lib/supabase/client'
import type { 
  RevenueReport, 
  AppointmentReport, 
  ClientReport, 
  TeamReport,
  LoyaltyReport,
  ReportPeriod 
} from '../types'

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
    setDates({ start, end })
    
    // Atualiza a URL com os novos parâmetros de busca
    // Isso forçará o Next.js a re-executar as queries no servidor
    const params = new URLSearchParams()
    params.set('start', start)
    params.set('end', end)
    params.set('period', period)
    
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageTitle 
          title="Relatórios & Insights" 
          subtitle="Analise a performance financeira e operacional da sua barbearia" 
        />
        <ExportButton 
          kpis={revenue.kpis as any}
          chartData={revenue.chartData as any}
          paymentMethods={revenue.paymentMethods as any}
          barberPerformance={(revenue as any).barberPerformance || []}
          period={`${new Date(dates.start).toLocaleDateString('pt-BR')} → ${new Date(dates.end).toLocaleDateString('pt-BR')}`}
        />
      </div>

      <PeriodSelector onPeriodChange={handlePeriodChange} />

      {isPending ? (
        <div className="h-96 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-12">
          <RevenueSection data={revenue} />
          <AppointmentsSection data={appointments} />
          <ClientsSection data={clients} />
          <TeamSection data={team} />
          <LoyaltySection data={loyalty} />
        </div>
      )}
    </div>
  )
}
