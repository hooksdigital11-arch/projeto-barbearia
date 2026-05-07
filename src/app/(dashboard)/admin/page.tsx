import { Suspense } from 'react'
import { AdminDashboard } from '@/features/admin/components/admin-dashboard'

import { requireAdmin } from '@/lib/auth/require-auth'
import { getAdminKPIs, getBarbersPerformance } from '@/features/admin/queries'

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ period?: string; q?: string }>
}) {
  const profile = await requireAdmin()
  const params = await searchParams
  const period = params.period || 'month'
  const search = params.q || ''
  
  // Fetch initial data for the client component
  const [kpis, barbers] = await Promise.all([
    getAdminKPIs(period, search),
    getBarbersPerformance(search)
  ])

  return (
    <Suspense fallback={<div className="p-8 text-white">Carregando Dashboard Admin...</div>}>
      <AdminDashboard initialKpis={kpis} initialBarbers={barbers} organizationId={profile.organization_id} />
    </Suspense>
  )
}
