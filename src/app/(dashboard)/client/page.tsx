import { Suspense } from 'react'
import { ClientDashboard } from '@/features/client/components/client-dashboard'

export default async function ClientPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Carregando seu espaço...</div>}>
      <ClientDashboard />
    </Suspense>
  )
}
