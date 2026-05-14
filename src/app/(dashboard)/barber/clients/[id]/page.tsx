import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { requireBarber } from '@/lib/auth/require-auth'
import { getClientById, getBarbers } from '@/features/clients/queries'
import { getLoyaltyConfig } from '@/features/loyalty/queries'
import { ClientProfileComponent } from '@/features/clients/components/client-profile'
import { DEFAULT_LOYALTY_CONFIG } from '@/features/loyalty/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BarberClientProfilePage({ params }: PageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Content clientId={id} />
    </Suspense>
  )
}

async function Content({ clientId }: { clientId: string }) {
  await requireBarber()

  const [client, barbers, loyaltyConfig] = await Promise.all([
    getClientById(clientId),
    getBarbers(),
    getLoyaltyConfig(),
  ])

  if (!client) notFound()

  const goal = loyaltyConfig.mode === 'stamps'
    ? loyaltyConfig.stamps_required
    : loyaltyConfig.points_required

  return (
    <ClientProfileComponent
      client={client}
      barbers={barbers}
      role="barber"
      basePath="/barber/clients"
      loyaltyGoal={goal}
    />
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}
