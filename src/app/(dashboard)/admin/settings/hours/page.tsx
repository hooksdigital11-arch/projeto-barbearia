import { BusinessHours } from '@/features/admin-settings/components/business-hours'
import { getOrganizationSettings } from '@/features/admin-settings/queries'

export default async function BusinessHoursPage() {
  const organization = await getOrganizationSettings()
  return <BusinessHours initialData={organization?.business_hours} />
}
