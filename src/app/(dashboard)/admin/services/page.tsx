import { Suspense } from 'react'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { requireAdmin } from '@/lib/auth/require-auth'
import { getAllServices, getServiceStats } from '@/features/service/queries'
import { AdminServicesPage } from '@/features/service/components/admin-services-page'

export const metadata = {
  title: 'Serviços | Admin',
  description: 'Gerencie o catálogo completo de serviços da sua barbearia.',
}

export default async function AdminServicesRoute() {
  return (
    <Suspense fallback={<ServicesSkeleton />}>
      <Content />
    </Suspense>
  )
}

async function Content() {
  await requireAdmin()
  const [services, stats] = await Promise.all([
    getAllServices(),
    getServiceStats(),
  ])

  return <AdminServicesPage services={services} stats={stats} />
}

function ServicesSkeleton() {
  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-14 w-44 rounded-3xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[500px] rounded-3xl" />
    </div>
  )
}
