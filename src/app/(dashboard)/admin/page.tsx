import { requireAdmin } from '@/lib/auth/require-auth'
import { AdminHome } from '@/features/admin/components/admin-home'

export default async function AdminPage() {
  const profile = await requireAdmin()

  return (
    <AdminHome userName={profile.full_name || 'Admin'} />
  )
}
