import { Suspense } from 'react'
import { requireAdmin } from '@/lib/auth/require-auth'
import { getInventory, getInventoryStats } from '@/features/inventory/queries'
import { InventoryPage } from '@/features/inventory/components/inventory-page'
import { Skeleton } from '@/components/ui/skeleton'

export default async function AdminInventoryPage() {
  await requireAdmin()
  return (
    <Suspense fallback={<InventorySkeleton />}>
      <InventoryContent />
    </Suspense>
  )
}

async function InventoryContent() {
  const [activeItems, inactiveItems, stats] = await Promise.all([
    getInventory(true),
    getInventory(false),
    getInventoryStats(),
  ])

  return <InventoryPage activeItems={activeItems} inactiveItems={inactiveItems} stats={stats} userRole="admin" />
}

function InventorySkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-14 w-40 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-[2rem]" />
        ))}
      </div>
      <Skeleton className="h-[400px] w-full rounded-[2rem]" />
    </div>
  )
}
