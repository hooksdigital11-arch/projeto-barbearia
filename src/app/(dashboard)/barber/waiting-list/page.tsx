import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { requireBarber } from '@/lib/auth/require-auth'
import {
  getWaitingList,
  getQueueStats,
  getAvailableServices,
  getAvailableBarbers,
  getAvailableClients,
} from '@/features/waiting-list/queries'
import { WaitingListPageBarber } from '@/features/waiting-list/components/waiting-list-page-barber'

export default async function BarberWaitingListPage() {
  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <Suspense fallback={<WaitingListSkeleton />}>
        <Content />
      </Suspense>
    </main>
  )
}

async function Content() {
  const user = await requireBarber()

  const [entries, stats, services, barbers, clients] = await Promise.all([
    getWaitingList(),
    getQueueStats(),
    getAvailableServices(),
    getAvailableBarbers(),
    getAvailableClients(),
  ])

  return (
    <WaitingListPageBarber
      entries={entries}
      stats={stats}
      services={services}
      barbers={barbers}
      clients={clients}
      organizationId={user.organization_id}
    />
  )
}

function WaitingListSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-12 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
