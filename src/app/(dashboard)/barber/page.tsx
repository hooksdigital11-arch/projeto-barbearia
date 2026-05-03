import { Suspense } from 'react'
import { BarberDashboard } from '@/features/barber/components/barber-dashboard'

export default async function BarberPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Carregando Dashboard Operacional...</div>}>
      <BarberDashboard />
    </Suspense>
  )
}
