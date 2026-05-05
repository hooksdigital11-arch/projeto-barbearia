import { NotificationsSettings } from '@/features/admin-settings/components/notifications-settings'
import { getNotificationPreferences } from '@/features/admin-settings/queries'

export default async function NotificationsPage() {
  const preferences = await getNotificationPreferences()
  return <NotificationsSettings initialData={preferences} />
}
