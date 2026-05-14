import { Suspense } from 'react'
import { requireAdmin } from '@/lib/auth/require-auth'
import {
  getAppointments,
  getAppointmentStats,
  getServices,
  getBarbersForAppointment,
  getClientsForAppointment,
} from '@/features/appointment/queries'
import { AdminAppointmentsPage } from '@/features/appointment/components/admin-appointments-page'

export const metadata = {
  title: 'Agendamentos | Admin',
  description: 'Gerencie todos os agendamentos da barbearia.',
}

export default async function AdminAppointmentsRoute({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const params = await searchParams
  const period = (params.period as 'today' | 'week' | 'month') || 'today'

  await requireAdmin()

  const [appointments, stats, services, barbers, clients] = await Promise.all([
    getAppointments({ period }),
    getAppointmentStats(),
    getServices(),
    getBarbersForAppointment(),
    getClientsForAppointment(),
  ])

  return (
    <Suspense fallback={<div className="animate-pulse h-[400px] bg-white/5 rounded-2xl" />}>
      <AdminAppointmentsPage
        appointments={appointments}
        stats={stats}
        services={services}
        barbers={barbers}
        clients={clients}
        initialPeriod={period}
      />
    </Suspense>
  )
}
