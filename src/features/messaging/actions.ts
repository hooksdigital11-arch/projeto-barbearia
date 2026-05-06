'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import { sendMessageSchema, broadcastSchema } from './schemas'
import { getClientsForMessaging } from './queries'

const REVALIDATE = ['/admin/messaging', '/barber/messaging']
function revalidateAll() {
  REVALIDATE.forEach(p => revalidatePath(p))
}

/**
 * Registra uma mensagem enviada no banco.
 * O envio real via WhatsApp acontece no cliente via window.open.
 */
export async function recordMessage(formData: FormData) {
  const user = await requireUser()
  if (!['admin', 'barber'].includes(user.role)) return { error: 'Sem permissão' }

  const parsed = sendMessageSchema.safeParse({
    client_id: formData.get('client_id'),
    content: formData.get('content'),
    template_used: formData.get('template_used') || null,
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos', issues: parsed.error.flatten() }
  }

  const { error } = await supabaseAdmin
    .from('messages')
    .insert({
      organization_id: user.organization_id,
      client_id: parsed.data.client_id,
      channel: 'whatsapp',
      direction: 'sent',
      content: parsed.data.content,
      template_used: parsed.data.template_used ?? null,
      status: 'sent',
      sent_by: user.id,
    })

  if (error) {
    console.error('[RECORD_MESSAGE]', error.message)
    return { error: 'Erro ao salvar mensagem' }
  }

  revalidateAll()
  return { success: true }
}

/**
 * Registra múltiplas mensagens de um disparo em massa (broadcast).
 * O envio real de cada link WhatsApp é feito no cliente.
 */
export async function recordBroadcast(formData: FormData) {
  const user = await requireUser()
  if (user.role !== 'admin') return { error: 'Sem permissão' }

  const parsed = broadcastSchema.safeParse({
    group: formData.get('group'),
    template_key: formData.get('template_key'),
    content: formData.get('content'),
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos', issues: parsed.error.flatten() }
  }

  const clients = await getClientsForMessaging(parsed.data.group)

  if (clients.length === 0) {
    return { error: 'Nenhum cliente encontrado para o grupo selecionado' }
  }

  const messages = clients.map(c => ({
    organization_id: user.organization_id,
    client_id: c.id,
    channel: 'whatsapp',
    direction: 'sent' as const,
    content: parsed.data.content,
    template_used: parsed.data.template_key,
    status: 'sent' as const,
    sent_by: user.id,
  }))

  const { error } = await supabaseAdmin.from('messages').insert(messages)

  if (error) {
    console.error('[RECORD_BROADCAST]', error.message)
    return { error: 'Erro ao registrar disparo' }
  }

  revalidateAll()
  return { success: true, count: clients.length, clients }
}
