import { Suspense } from 'react'
import { requireBarber } from '@/lib/auth/require-auth'
import {
  getBarberRevenueReport,
  getBarberAppointmentsReport,
  getClientsReport,
  getTeamReport,
  getLoyaltyReport,
} from '@/features/reports/queries'
import { ReportsPage } from '@/features/reports/components/reports-page'

export const metadata = {
  title: 'Relatórios | Barber',
}

export default async function BarberReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>
}) {
  const profile = await requireBarber()
  const params = await searchParams

  const now = new Date()
  const defaultEnd = new Date(now)
  defaultEnd.setHours(23, 59, 59, 999)
  const defaultStart = new Date(now)
  defaultStart.setHours(0, 0, 0, 0)
  defaultStart.setMonth(defaultStart.getMonth() - 1)

  const end = params.end || defaultEnd.toISOString()
  const start = params.start || defaultStart.toISOString()

  return (
    <Suspense fallback={<ReportsLoading />}>
      <ReportsContent
        startDate={start}
        endDate={end}
        organizationId={profile.organization_id}
        barberName={profile.full_name || 'Barbeiro'}
      />
    </Suspense>
  )
}

async function ReportsContent({
  startDate,
  endDate,
  organizationId,
  barberName,
}: {
  startDate: string
  endDate: string
  organizationId: string
  barberName: string
}) {
  const [revenue, appointments, clients, team, loyalty] = await Promise.all([
    getBarberRevenueReport(startDate, endDate),
    getBarberAppointmentsReport(startDate, endDate),
    getClientsReport(startDate, endDate),
    getTeamReport(startDate, endDate),
    getLoyaltyReport(startDate, endDate),
  ])

  return (
    <ReportsPage
      initialRevenue={revenue}
      initialAppointments={appointments}
      initialClients={clients}
      initialTeam={team}
      initialLoyalty={loyalty}
      organizationId={organizationId}
      orgName="Barbearia"
      adminName={barberName}
    />
  )
}

function ReportsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-20 bg-white/5 rounded-2xl" />
      <div className="h-16 bg-white/5 rounded-2xl" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-white/5 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-80 bg-white/5 rounded-2xl" />
        <div className="h-80 bg-white/5 rounded-2xl" />
      </div>
    </div>
  )
}
