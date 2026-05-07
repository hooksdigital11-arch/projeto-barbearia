import { Suspense } from 'react'
import { 
  getRevenueReport, 
  getAppointmentsReport, 
  getClientsReport, 
  getTeamReport 
} from '@/features/reports/queries'
import { ReportsPage } from '@/features/reports/components/reports-page'
import { requireAdmin } from '@/lib/auth/require-auth'

export default async function AdminReportsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ start?: string; end?: string }> 
}) {
  const profile = await requireAdmin()
  const params = await searchParams

  // Default dates if none provided
  const end = params.end || new Date().toISOString()
  const start = params.start || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()

  return (
    <Suspense fallback={<ReportsLoading />}>
      <ReportsContent startDate={start} endDate={end} organizationId={profile.organization_id} />
    </Suspense>
  )
}

async function ReportsContent({ startDate, endDate, organizationId }: { startDate: string, endDate: string, organizationId: string }) {
  const [revenue, appointments, clients, team] = await Promise.all([
    getRevenueReport(startDate, endDate),
    getAppointmentsReport(startDate, endDate),
    getClientsReport(startDate, endDate),
    getTeamReport(startDate, endDate),
  ])

  return (
    <ReportsPage 
      initialRevenue={revenue}
      initialAppointments={appointments}
      initialClients={clients}
      initialTeam={team}
      organizationId={organizationId}
    />
  )
}

function ReportsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-20 bg-white/5 rounded-2xl" />
      <div className="h-16 bg-white/5 rounded-2xl" />
      <div className="grid grid-cols-4 gap-4">
        <div className="h-32 bg-white/5 rounded-2xl" />
        <div className="h-32 bg-white/5 rounded-2xl" />
        <div className="h-32 bg-white/5 rounded-2xl" />
        <div className="h-32 bg-white/5 rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-80 bg-white/5 rounded-2xl" />
        <div className="h-80 bg-white/5 rounded-2xl" />
      </div>
    </div>
  )
}
