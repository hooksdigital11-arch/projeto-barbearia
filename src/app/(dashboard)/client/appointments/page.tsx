import { Suspense } from 'react'
import { requireClient } from '@/lib/auth/require-auth'
import { getAppointments } from '@/features/appointment/queries'
import { ClientAppointmentsPage } from '@/features/appointment/components/client-appointments-page'

export const metadata = {
  title: 'Meus Agendamentos | Cliente',
  description: 'Acompanhe seus agendamentos.',
}

export default async function ClientAppointmentsRoute() {
  await requireClient()

  const appointments = await getAppointments()

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <Suspense fallback={<div className="animate-pulse h-[400px] bg-white/5 rounded-2xl" />}>
        <ClientAppointmentsPage appointments={appointments} />
      </Suspense>
    </div>
  )
}
