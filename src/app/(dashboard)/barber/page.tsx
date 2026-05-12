import { Suspense } from 'react'
import { BarberDashboard } from '@/features/barber/components/barber-dashboard'

import { requireBarber } from '@/lib/auth/require-auth'
import { getBarberDashboardData } from '@/features/barber/queries'

export default async function BarberPage() {
  const profile = await requireBarber()
  const data = await getBarberDashboardData()
  
  return (
    <Suspense fallback={<div className="p-8 text-text-primary">Carregando Home...</div>}>
      <BarberDashboard initialData={data} organizationId={profile.organization_id} />
    </Suspense>
  )
}
