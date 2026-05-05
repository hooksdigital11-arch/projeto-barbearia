import { Suspense } from 'react'
import { getLoyaltyConfig, getAllClientsLoyalty, getLoyaltyStats } from '@/features/loyalty/queries'
import { LoyaltyPageAdmin } from '@/features/loyalty/components/loyalty-page-admin'
import { Skeleton } from '@/components/ui/skeleton'

export default async function AdminLoyaltyPage() {
  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <Suspense fallback={<LoyaltySkeleton />}>
        <LoyaltyContent />
      </Suspense>
    </main>
  )
}

async function LoyaltyContent() {
  const [config, clients, stats] = await Promise.all([
    getLoyaltyConfig(),
    getAllClientsLoyalty(),
    getLoyaltyStats(),
  ])

  return <LoyaltyPageAdmin config={config} clients={clients} stats={stats} />
}

function LoyaltySkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-64 rounded-[2rem]" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-[2rem]" />
        ))}
      </div>
      <Skeleton className="h-[300px] rounded-[2rem]" />
    </div>
  )
}
