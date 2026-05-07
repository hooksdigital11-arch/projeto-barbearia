import { Suspense } from 'react'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { requireBarber } from '@/lib/auth/require-auth'
import { getActiveServices } from '@/features/service/queries'
import { BarberServicesPage } from '@/features/service/components/barber-services-page'

export const metadata = {
  title: 'Serviços | Barbeiro',
  description: 'Consulte o catálogo de serviços disponíveis.',
}

export default async function BarberServicesRoute() {
  return (
    <Suspense fallback={<ServicesSkeleton />}>
      <Content />
    </Suspense>
  )
}

async function Content() {
  await requireBarber()
  const services = await getActiveServices()
  return <BarberServicesPage services={services} />
}

function ServicesSkeleton() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
