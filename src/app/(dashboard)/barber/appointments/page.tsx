import { Suspense } from 'react'
import { requireBarber } from '@/lib/auth/require-auth'
import {
  getAppointments,
  getServices,
  getClientsForAppointment,
} from '@/features/appointment/queries'
import { BarberAppointmentsPage } from '@/features/appointment/components/barber-appointments-page'

export const metadata = {
  title: 'Agendamentos | Barbeiro',
  description: 'Sua agenda do dia.',
}

export default async function BarberAppointmentsRoute() {
  const user = await requireBarber()

  const [appointments, services, clients] = await Promise.all([
    getAppointments({ period: 'today' }),
    getServices(),
    getClientsForAppointment(),
  ])

  return (
    <Suspense fallback={<div className="animate-pulse h-[400px] bg-white/5 rounded-2xl" />}>
      <BarberAppointmentsPage
        appointments={appointments}
        services={services}
        clients={clients}
        barberId={user.id}
      />
    </Suspense>
  )
}
