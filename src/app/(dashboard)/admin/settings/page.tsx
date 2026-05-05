import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/require-auth'

export default async function AdminSettingsPage() {
  await requireAdmin()
  redirect('/admin/settings/general')
}
