'use client'

import { useState, useTransition } from 'react'
import { PeriodSelector } from './period-selector'
import { RevenueSection } from './revenue-section'
import { AppointmentsSection } from './appointments-section'
import { ClientsSection } from './clients-section'
import { TeamSection } from './team-section'
import { ExportButton } from './export-button'
import { PageTitle } from '@/components/shared/page-title'
import type { 
  RevenueReport, 
  AppointmentReport, 
  ClientReport, 
  TeamReport, 
  ReportPeriod 
} from '../types'

interface ReportsPageProps {
  initialRevenue: RevenueReport
  initialAppointments: AppointmentReport
  initialClients: ClientReport
  initialTeam: TeamReport
}

export function ReportsPage({ 
  initialRevenue, 
  initialAppointments, 
  initialClients, 
  initialTeam 
}: ReportsPageProps) {
  const [dates, setDates] = useState({ 
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
    end: new Date().toISOString()
  })
  const [revenue, setRevenue] = useState(initialRevenue)
  const [appointments, setAppointments] = useState(initialAppointments)
  const [clients, setClients] = useState(initialClients)
  const [team, setTeam] = useState(initialTeam)
  const [isPending, startTransition] = useTransition()

  const handlePeriodChange = (start: string, end: string, period: ReportPeriod) => {
    setDates({ start, end })
    // In a real app, we would call Server Actions here to fetch new data
    // For this implementation, we rely on the initial data or simulated updates
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageTitle 
          title="Relatórios & Insights" 
          subtitle="Analise a performance financeira e operacional da sua barbearia" 
        />
        <ExportButton startDate={dates.start} endDate={dates.end} />
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
        </div>
      )}
    </div>
  )
}
