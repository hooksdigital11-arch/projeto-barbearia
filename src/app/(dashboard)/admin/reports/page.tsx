import { Suspense } from 'react'
import {
  getRevenueReport,
  getAppointmentsReport,
  getClientsReport,
  getTeamReport,
  getLoyaltyReport
} from '@/features/reports/queries'
import { ReportsPage } from '@/features/reports/components/reports-page'
import { requireAdmin } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'

export default async function AdminReportsPage({
  searchParams
}: {
  searchParams: Promise<{ start?: string; end?: string }>
}) {
  const profile = await requireAdmin()
  const params = await searchParams

  // Default dates if none provided
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
        adminName={profile.full_name || 'Administrador'}
      />
    </Suspense>
  )
}

async function ReportsContent({
  startDate,
  endDate,
  organizationId,
  adminName
}: {
  startDate: string
  endDate: string
  organizationId: string
  adminName: string
}) {
  const supabase = await createClient()
  const [revenue, appointments, clients, team, loyalty, { data: org }] = await Promise.all([
    getRevenueReport(startDate, endDate),
    getAppointmentsReport(startDate, endDate),
    getClientsReport(startDate, endDate),
    getTeamReport(startDate, endDate),
    getLoyaltyReport(startDate, endDate),
    supabase.from('organizations').select('name').eq('id', organizationId).single(),
  ])

  return (
    <ReportsPage
      initialRevenue={revenue}
      initialAppointments={appointments}
      initialClients={clients}
      initialTeam={team}
      initialLoyalty={loyalty}
      organizationId={organizationId}
      orgName={(org as any)?.name || 'Barbearia'}
      adminName={adminName}
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
