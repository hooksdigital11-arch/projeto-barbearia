import { Suspense } from 'react'
import { BarberDashboard } from '@/features/barber/components/barber-dashboard'

import { requireBarber } from '@/lib/auth/require-auth'

export default async function BarberPage() {
  await requireBarber()
  return (
    <Suspense fallback={<div className="p-8 text-white">Carregando Dashboard Operacional...</div>}>
      <BarberDashboard />
    </Suspense>
  )
}
