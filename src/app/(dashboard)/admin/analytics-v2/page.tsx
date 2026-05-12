import { Suspense } from 'react'
import { getDashboardStats } from '@/features/analytics/queries'
import { requireUser } from '@/lib/auth/require-auth'
import { AnalyticsV2Dashboard } from '@/features/analytics/components/analytics-v2-dashboard'

export default async function AnalyticsV2Page() {
  const user = await requireUser()
  const stats = await getDashboardStats()

  return (
    <Suspense fallback={<div className="p-8 text-text-primary">Carregando métricas analíticas...</div>}>
      <AnalyticsV2Dashboard initialData={stats} organizationId={user.organization_id} />
    </Suspense>
  )
}
