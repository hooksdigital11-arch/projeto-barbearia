import { Suspense } from 'react'
import { requireClient } from '@/lib/auth/require-auth'
import { getAppointments, getServices, getBarbersForAppointment } from '@/features/appointment/queries'
import { ClientAppointmentsPage } from '@/features/appointment/components/client-appointments-page'

export const metadata = {
  title: 'Meus Agendamentos | Cliente',
  description: 'Acompanhe seus agendamentos.',
}

export default async function ClientAppointmentsRoute({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>
}) {
  await requireClient()
  const params = await searchParams
  const initialServiceId = params.service

  const [appointments, services, barbers] = await Promise.all([
    getAppointments(),
    getServices(),
    getBarbersForAppointment(),
  ])

  return (
    <Suspense fallback={<div className="animate-pulse h-[400px] bg-white/5 rounded-2xl" />}>
      <ClientAppointmentsPage
        appointments={appointments}
        services={services}
        barbers={barbers}
        initialServiceId={initialServiceId}
      />
    </Suspense>
  )
}
