import { Suspense } from 'react'
import { AdminDashboard } from '@/features/admin/components/admin-dashboard'

import { requireAdmin } from '@/lib/auth/require-auth'

export default async function AdminPage() {
  await requireAdmin()
  return (
    <Suspense fallback={<div className="p-8 text-white">Carregando Dashboard Admin...</div>}>
      <AdminDashboard />
    </Suspense>
  )
}
