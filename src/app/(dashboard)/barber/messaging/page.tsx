import { Suspense } from 'react'
import { requireBarber } from '@/lib/auth/require-auth'
import { getConversations, getMessagingStats, getClientsForMessaging } from '@/features/messaging/queries'
import { getOrganization } from '@/features/organization/queries'
import { MessagingPage } from '@/features/messaging/components/messaging-page'

export const metadata = {
  title: 'Mensageria | Barbeiro',
  description: 'Envie mensagens WhatsApp para seus clientes.',
}

export default async function BarberMessagingRoute() {
  const user = await requireBarber()

  const [conversations, stats, clients, org] = await Promise.all([
    getConversations(),
    getMessagingStats(),
    getClientsForMessaging(),
    getOrganization(user.organization_id),
  ])

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <Suspense fallback={<div className="animate-pulse h-[400px] bg-white/5 rounded-2xl" />}>
        <MessagingPage
          conversations={conversations}
          stats={stats}
          clients={clients}
          orgName={org?.name || 'Barbearia'}
          isAdmin={false}
        />
      </Suspense>
    </div>
  )
}
