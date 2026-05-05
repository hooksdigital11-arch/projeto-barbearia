import { DangerZone } from '@/features/admin-settings/components/danger-zone'
import { getOrganizationSettings } from '@/features/admin-settings/queries'

export default async function DangerZonePage() {
  const org = await getOrganizationSettings()
  
  return <DangerZone initialStatus={org?.status} />
}
