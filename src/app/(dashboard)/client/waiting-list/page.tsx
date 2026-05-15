import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { requireClient } from '@/lib/auth/require-auth'
import {
  getClientQueuePosition,
  getClientIdForProfile,
  getAvailableServices,
  getAvailableBarbers,
} from '@/features/waiting-list/queries'
import { WaitingListPageClient } from '@/features/waiting-list/components/waiting-list-page-client'

export default async function ClientWaitingListPage() {
  return (
    <Suspense fallback={<WaitingListSkeleton />}>
      <Content />
    </Suspense>
  )
}

async function Content() {
  const user = await requireClient()

  const [clientId, services, barbers] = await Promise.all([
    getClientIdForProfile(),
    getAvailableServices(),
    getAvailableBarbers(),
  ])

  // Buscar posição na fila (se tiver clientId)
  const entry = clientId ? await getClientQueuePosition(clientId) : null

  return (
    <WaitingListPageClient
      entry={entry}
      clientId={clientId}
      services={services}
      barbers={barbers}
      organizationId={user.organization_id}
    />
  )
}

function WaitingListSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-[400px] rounded-3xl" />
    </div>
  )
}
