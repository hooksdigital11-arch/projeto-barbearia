import { BusinessHours } from '@/features/admin-settings/components/business-hours'
import { getOrganizationSettings } from '@/features/admin-settings/queries'

export const revalidate = 600

export default async function BusinessHoursPage() {
  const organization = await getOrganizationSettings()
  return <BusinessHours initialData={organization?.business_hours} />
}
