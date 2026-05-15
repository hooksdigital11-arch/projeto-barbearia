import { Suspense } from 'react'
import { requireBarber } from '@/lib/auth/require-auth'
import { getLoyaltyConfig, getAllClientsLoyalty, getLoyaltyStats } from '@/features/loyalty/queries'
import { LoyaltyPageAdmin } from '@/features/loyalty/components/loyalty-page-admin'
import { Skeleton } from '@/components/ui/skeleton'

export default async function BarberLoyaltyPage() {
  await requireBarber()
  return (
    <Suspense fallback={<LoyaltySkeleton />}>
      <LoyaltyContent />
    </Suspense>
  )
}

async function LoyaltyContent() {
  const [config, clients, stats] = await Promise.all([
    getLoyaltyConfig(),
    getAllClientsLoyalty(),
    getLoyaltyStats(),
  ])

  // Barbeiro vê a mesma tabela mas sem config panel (vai no admin page)
  return <LoyaltyPageAdmin config={config} clients={clients} stats={stats} />
}

function LoyaltySkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-[2rem]" />
        ))}
      </div>
      <Skeleton className="h-[300px] rounded-[2rem]" />
    </div>
  )
}
