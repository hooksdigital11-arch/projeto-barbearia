import { SettingsLayout } from '@/features/admin-settings/components/settings-layout'
import { PageTitle } from '@/components/shared/page-title'
import { requireAdmin } from '@/lib/auth/require-auth'

export default async function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <SettingsLayout>
      {children}
    </SettingsLayout>
  )
}
