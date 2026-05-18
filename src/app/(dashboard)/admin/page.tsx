import { requireAdmin } from '@/lib/auth/require-auth'
import { AdminHome } from '@/features/admin/components/admin-home'
import { getAdminHomeSummary } from '@/features/admin/queries'

export default async function AdminPage() {
  const [profile, summary] = await Promise.all([
    requireAdmin(),
    getAdminHomeSummary(),
  ])

  return (
    <AdminHome userName={profile.full_name || 'Admin'} summary={summary} />
  )
}
