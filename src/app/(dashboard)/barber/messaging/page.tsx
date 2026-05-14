import { Suspense } from 'react'
import { requireBarber } from '@/lib/auth/require-auth'
import { getConversations, getMessagingStats, getClientsForMessaging, getMessageTemplates } from '@/features/messaging/queries'
import { getOrganization } from '@/features/organization/queries'
import { MessagingPage } from '@/features/messaging/components/messaging-page'

export const metadata = {
  title: 'Mensageria | Barbeiro',
  description: 'Envie mensagens WhatsApp para seus clientes.',
}

export default async function BarberMessagingRoute() {
  const user = await requireBarber()

  const [conversations, stats, clients, templates, org] = await Promise.all([
    getConversations(),
    getMessagingStats(),
    getClientsForMessaging(),
    getMessageTemplates(),
    getOrganization(user.organization_id),
  ])

  return (
    <Suspense fallback={<div className="animate-pulse h-[400px] bg-white/5 rounded-2xl" />}>
      <MessagingPage
        conversations={conversations}
        stats={stats}
        clients={clients}
        templates={templates}
        orgName={org?.name || 'Barbearia'}
        isAdmin={false}
      />
    </Suspense>
  )
}
