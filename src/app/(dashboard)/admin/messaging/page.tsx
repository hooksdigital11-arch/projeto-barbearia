import { Suspense } from 'react'
import { requireAdmin } from '@/lib/auth/require-auth'
import { getConversations, getMessagingStats, getClientsForMessaging, getMessageTemplates } from '@/features/messaging/queries'
import { getOrganization } from '@/features/organization/queries'
import { MessagingPage } from '@/features/messaging/components/messaging-page'

export const metadata = {
  title: 'Mensageria | Admin',
  description: 'Comunicação via WhatsApp com clientes.',
}

export default async function AdminMessagingRoute() {
  const user = await requireAdmin()

  try {
    const [conversations, stats, clients, templates, org] = await Promise.all([
      getConversations(),
      getMessagingStats(),
      getClientsForMessaging(),
      getMessageTemplates(),
      getOrganization(user.organization_id),
    ])

    return (
      <MessagingPage
        conversations={conversations}
        stats={stats}
        clients={clients}
        templates={templates}
        org={org}
        isAdmin
      />
    )
  } catch (err) {
    throw err
  }
}
