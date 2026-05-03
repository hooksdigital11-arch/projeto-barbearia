import { Suspense } from 'react'
import { ClientDashboard } from '@/features/client/components/client-dashboard'

import { requireClient } from '@/lib/auth/require-auth'

export default async function ClientPage() {
  await requireClient()
  return (
    <Suspense fallback={<div className="p-8 text-white">Carregando seu espaço...</div>}>
      <ClientDashboard />
    </Suspense>
  )
}
