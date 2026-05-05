import { Suspense } from 'react'
import { getTeamWithStats, getTeamStats } from '@/features/team/queries'
import { requireBarber } from '@/lib/auth/require-auth'
import { TeamPage } from '@/features/team/components/team-page'
import { Skeleton } from '@/components/ui/skeleton'

export default async function BarberTeamPage() {
  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <Suspense fallback={<TeamSkeleton />}>
        <TeamContent />
      </Suspense>
    </main>
  )
}

async function TeamContent() {
  const user = await requireBarber()
  const [members, stats] = await Promise.all([
    getTeamWithStats(),
    getTeamStats(),
  ])

  return <TeamPage members={members} stats={stats} userRole="barber" currentUserId={user.id} />
}

function TeamSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-56 rounded-[2rem]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-72 rounded-[2rem]" />
        ))}
      </div>
    </div>
  )
}
