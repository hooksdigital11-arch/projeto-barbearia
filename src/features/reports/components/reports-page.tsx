'use client'

import dynamic from 'next/dynamic'
import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PeriodSelector } from './period-selector'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
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
    <div className="relative min-h-screen pb-20">
      
      <div className="space-y-12 animate-in fade-in duration-1000">
        {/* Header com Design Assimétrico */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-3 h-12 bg-accent-cyan rounded-full shadow-[0_0_30px_rgba(0,229,255,0.4)]" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-syne text-white tracking-tighter leading-none">
                Insights<span className="text-accent-cyan">.</span>
              </h1>
            </div>
            <p className="text-text-secondary text-lg font-medium max-w-md ml-7 border-l border-white/10 pl-6">
              Inteligência de dados para uma gestão de alto nível. Analise cada detalhe da sua performance.
            </p>
          </div>
          <div className="flex items-center gap-4 lg:ml-0">
            <ExportButton 
              kpis={revenue.kpis as any}
              chartData={revenue.chartData as any}
              paymentMethods={revenue.paymentMethods as any}
              barberPerformance={(revenue as any).barberPerformance || []}
              period={`${new Date(dates.start).toLocaleDateString('pt-BR')} → ${new Date(dates.end).toLocaleDateString('pt-BR')}`}
            />
          </div>
        </div>

        {/* Seletor de Período com Estética Flutuante */}
        <div className="relative z-20 translate-y-2">
          <PeriodSelector onPeriodChange={handlePeriodChange} />
        </div>

        {isPending ? (
          <div className="h-96 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-accent-cyan/20 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-t-2 border-accent-cyan rounded-full animate-spin" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan animate-pulse">
              Processando Big Data
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-20">
            <div style={{ animationDelay: '100ms' }} className="animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-both">
              <RevenueSection data={revenue} />
            </div>
            
            <div className="space-y-20">
              <div style={{ animationDelay: '200ms' }} className="animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-both">
                <AppointmentsSection data={appointments} />
              </div>
              <div style={{ animationDelay: '300ms' }} className="animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-both">
                <ClientsSection data={clients} />
              </div>
            </div>

            <div style={{ animationDelay: '400ms' }} className="animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-both">
              <TeamSection data={team} />
            </div>

            <div style={{ animationDelay: '500ms' }} className="animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-both">
              <LoyaltySection data={loyalty} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
