import { Suspense } from 'react'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { requireUser } from '@/lib/auth/require-auth'
import { getActiveServices } from '@/features/service/queries'
import { ClientServicesPage } from '@/features/service/components/client-services-page'

export const metadata = {
  title: 'Serviços | Agendar',
  description: 'Escolha o serviço desejado e agende seu horário.',
}

export default async function ClientServicesRoute() {
  return (
    <Suspense fallback={<ServicesSkeleton />}>
      <Content />
    </Suspense>
  )
}

async function Content() {
  await requireUser()
  const services = await getActiveServices()
  return <ClientServicesPage services={services} />
}

function ServicesSkeleton() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>
      <Skeleton className="h-14 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
