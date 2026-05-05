import { GeneralSettings } from '@/features/admin-settings/components/general-settings'
import { getOrganizationSettings } from '@/features/admin-settings/queries'

export default async function GeneralSettingsPage() {
  const organization = await getOrganizationSettings()
  return <GeneralSettings initialData={organization} />
}
