import 'server-only'
import { cache } from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import type { Message, MessageConversation, MessagingStats, ClientForMessage, MessageTemplate } from './types'

const MESSAGE_SELECT = `
  id, organization_id, client_id, channel, direction,
  content, template_used, status, error_message, sent_by, created_at,
  client:clients(id, full_name, phone),
  sender:profiles(id, full_name)
`

/**
 * Lista de conversas (agrupadas por cliente) — mostra último contato.
 */
export const getConversations = cache(async (): Promise<MessageConversation[]> => {
  const user = await requireUser()

  let query = supabaseAdmin
    .from('messages')
    .select(`
      client_id,
      content,
      created_at,
      direction,
      status,
      client:clients(id, full_name, phone)
    `)
    .eq('organization_id', user.organization_id)
    .not('client_id', 'is', null)
    .order('created_at', { ascending: false })

  const { data, error } = await query.limit(200)

  if (error) {
    console.error('[GET_CONVERSATIONS]', error.message)
    return []
  }

  // Group by client_id — keep the latest
  const map = new Map<string, MessageConversation>()
  type ConversationRow = {
    client_id: string
    content: string
    created_at: string
    direction: string
    status: string
    client: { id: string; full_name: string; phone: string | null } | null
  }
  for (const row of (data || []) as unknown as ConversationRow[]) {
    const cid = row.client_id
    if (!cid) continue // pula mensagens sem client_id
    if (!map.has(cid)) {
      map.set(cid, {
        client_id: cid,
        client_name: row.client?.full_name ?? 'Desconhecido',
        client_phone: row.client?.phone ?? null,
        last_message: row.content,
        last_message_at: row.created_at,
        direction: row.direction as 'sent' | 'received',
        unread_count: row.direction === 'received' && row.status !== 'read' ? 1 : 0,
        total_count: 1,
      })
    } else {
      const existing = map.get(cid)!
      existing.total_count++
      if (row.direction === 'received' && row.status !== 'read') {
        existing.unread_count++
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  )
})

/**
 * Histórico de mensagens de um cliente específico.
 */
export const getMessagesForClient = cache(async (clientId: string): Promise<Message[]> => {
  const user = await requireUser()

  const { data, error } = await supabaseAdmin
    .from('messages')
    .select(MESSAGE_SELECT)
    .eq('organization_id', user.organization_id)
    .eq('client_id', clientId)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) {
    console.error('[GET_MESSAGES_FOR_CLIENT]', error.message)
    return []
  }

  return (data || []) as unknown as Message[]
})

/**
 * KPI stats de mensagens.
 */
export const getMessagingStats = cache(async (): Promise<MessagingStats> => {
  const user = await requireUser()

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabaseAdmin
    .from('messages')
    .select('id, status, created_at')
    .eq('organization_id', user.organization_id)
    .eq('direction', 'sent')
    .gte('created_at', monthAgo)

  const rows = data || []

  return {
    today: rows.filter(r => r.created_at?.startsWith(today ?? '')).length,
    week: rows.filter(r => r.created_at >= weekAgo).length,
    month: rows.length,
    failed: rows.filter(r => r.status === 'failed').length,
  }
})

/**
 * Clientes disponíveis para envio de mensagem (com telefone).
 */
export const getClientsForMessaging = cache(async (group?: string): Promise<ClientForMessage[]> => {
  const user = await requireUser()
  const now = new Date()

  const query = supabaseAdmin
    .from('clients')
    .select('id, full_name, phone, last_visit_at, birthday, status')
    .eq('organization_id', user.organization_id)
    .not('phone', 'is', null)
    .neq('status', 'inactive')
    .order('full_name', { ascending: true })

  const { data } = await query

  let clients = (data || []) as ClientForMessage[]

  // Busca todos os stamps da org para calcular o saldo de cada cliente
  const { data: stamps } = await supabaseAdmin
    .from('loyalty_stamps')
    .select('client_id, type, amount')
    .eq('organization_id', user.organization_id)

  const balances: Record<string, number> = {}
  for (const s of stamps || []) {
    if (!s.client_id) continue
    if (s.type === 'redeem') balances[s.client_id] = 0
    else balances[s.client_id] = (balances[s.client_id] || 0) + s.amount
  }

  // Busca todos os próximos agendamentos futuros
  const nowStr = now.toISOString()
  const { data: futureAppts } = await supabaseAdmin
    .from('appointments')
    .select('client_id, start_time, price_cents, barber:profiles(full_name), service:services(name)')
    .eq('organization_id', user.organization_id)
    .eq('status', 'scheduled')
    .gte('start_time', nowStr)
    .order('start_time', { ascending: true })

  const nextAppts: Record<string, any> = {}
  for (const a of futureAppts || []) {
    if (!a.client_id) continue
    if (!nextAppts[a.client_id]) {
      nextAppts[a.client_id] = a
    }
  }

  // Busca agendamentos passados/completos ordenados pelo mais recente como fallback
  const { data: pastAppts } = await supabaseAdmin
    .from('appointments')
    .select('client_id, start_time, price_cents, barber:profiles(full_name), service:services(name)')
    .eq('organization_id', user.organization_id)
    .order('start_time', { ascending: false })

  const fallbackAppts: Record<string, any> = {}
  for (const a of pastAppts || []) {
    if (!a.client_id) continue
    if (!fallbackAppts[a.client_id]) {
      fallbackAppts[a.client_id] = a
    }
  }

  // Atribui carimbos e agendamento a cada cliente
  clients = clients.map(c => ({
    ...c,
    loyalty_balance: balances[c.id] || 0,
    next_appointment: nextAppts[c.id] || fallbackAppts[c.id] || null,
  }))

  if (group === 'birthday_month') {
    const thisMonth = now.getMonth()
    clients = clients.filter(c => {
      if (!c.birthday) return false
      return new Date(c.birthday).getMonth() === thisMonth
    })
  } else if (group === 'inactive_30') {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    clients = clients.filter(c => {
      if (!c.last_visit_at) return true
      return new Date(c.last_visit_at) < thirtyDaysAgo
    })
  } else if (group === 'loyalty_complete') {
    // Default goal: 10 stamps
    clients = clients.filter(c => (c.loyalty_balance || 0) >= 10)
  }

  return clients
})

/**
 * Busca templates de mensagens da organização
 */
export const getMessageTemplates = cache(async (): Promise<MessageTemplate[]> => {
  const user = await requireUser()

  const { data, error } = await supabaseAdmin
    .from('message_templates')
    .select('*')
    .eq('organization_id', user.organization_id)
    .eq('is_active', true)
    .order('is_system', { ascending: false }) // sistema primeiro
    .order('created_at', { ascending: true })

  if (error) {
    // Se a tabela não existir, apenas retornamos vazio sem logar erro crítico
    if (error.message.includes('message_templates') && error.message.includes('not find')) {
      return []
    }
    console.error('[GET_TEMPLATES]', error.message)
    return []
  }

  return (data || []) as unknown as MessageTemplate[]
})
