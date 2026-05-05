import { ServicesSettings } from '@/features/admin-settings/components/services-settings'
import { getServices } from '@/features/admin-settings/queries'

export default async function ServicesSettingsPage() {
  const services = await getServices()
  return <ServicesSettings initialData={services} />
}
