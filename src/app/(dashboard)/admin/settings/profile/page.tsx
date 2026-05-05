import { ProfileSettings } from '@/features/admin-settings/components/profile-settings'
import { requireAdmin } from '@/lib/auth/require-auth'

export default async function ProfileSettingsPage() {
  const profile = await requireAdmin() // Admin profile
  return <ProfileSettings initialData={profile} />
}
