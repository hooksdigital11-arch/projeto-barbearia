import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { requireAdmin } from '@/lib/auth/require-auth'
import { getClients, getClientsStats, getBarbers } from '@/features/clients/queries'
import { ClientsPage } from '@/features/clients/components/clients-page'

export default async function AdminClientsPage() {
  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <Suspense fallback={<ClientsSkeleton />}>
        <Content />
      </Suspense>
    </main>
  )
}

async function Content() {
  await requireAdmin()

  const [clients, stats, barbers] = await Promise.all([
    getClients(),
    getClientsStats(),
    getBarbers(),
  ])

  return (
    <ClientsPage
      clients={clients}
      stats={stats}
      barbers={barbers}
      role="admin"
      basePath="/admin/clients"
    />
  )
}

function ClientsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-12 w-28 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-12 w-full max-w-sm rounded-2xl" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
