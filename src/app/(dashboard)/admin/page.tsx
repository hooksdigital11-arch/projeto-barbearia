import { Suspense } from 'react'
import { AdminDashboard } from '@/features/admin/components/admin-dashboard'

export default async function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Carregando Dashboard Admin...</div>}>
      <AdminDashboard />
    </Suspense>
  )
}
