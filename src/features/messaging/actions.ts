'use server'

import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import { sendMessageSchema, broadcastSchema, templateSchema } from './schemas'
import { getClientsForMessaging } from './queries'
import { enviarMensagem, isEvolutionConfigured } from '@/lib/evolution'

const REVALIDATE = ['/admin/messaging', '/barber/messaging']
function revalidateAll() {
  REVALIDATE.forEach(p => revalidatePath(p))
}

interface OrgVars {
  name: string
  address?: string | null
  phone?: string | null
  loyalty_config?: any
}

interface ClientVars {
  full_name: string
  last_visit_at?: string | null
  birthday?: string | null
}

function applyTemplateVars(
  content: string,
  client: ClientVars,
  org: OrgVars | null,
  loyaltyBalance = 0
): string {
  const orgName = org?.name || 'Barbearia'
  const addressStr = org?.address || 'Não configurado'

  const phoneStr = org?.phone || 'Não configurado'
  
  const loyaltyConfig = org?.loyalty_config as any
  const goal = loyaltyConfig?.stamps_required || 10
  const remaining = Math.max(0, goal - loyaltyBalance)

  const lastVisit = client.last_visit_at
    ? new Date(client.last_visit_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    : 'Sem visitas registradas'

  return content
    .replace(/\{nome\}/gi, client.full_name || 'Cliente')
    .replace(/\{nome_barbearia\}/gi, orgName)
    .replace(/\{data\}/gi, new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }))
    .replace(/\{horario\}/gi, new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }))
    .replace(/\{servico\}/gi, 'serviço')
    .replace(/\{barbeiro\}/gi, 'seu barbeiro')
    .replace(/\{valor\}/gi, 'R$ 0,00')
    .replace(/\{link_agendamento\}/gi, 'barbearia.com')
    .replace(/\{endereco_barbearia\}/gi, addressStr)
    .replace(/\{telefone_barbearia\}/gi, phoneStr)
    .replace(/\{pontos_fidelidade\}/gi, String(loyaltyBalance))
    .replace(/\{proximo_selo\}/gi, String(remaining))
    .replace(/\{cupom_desconto\}/gi, 'VOLTE10')
    .replace(/\{ultima_visita\}/gi, lastVisit)
}

/**
 * Envia mensagem via Evolution API e registra no banco.
 */
export async function sendMessageAction(formData: FormData) {
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

  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('id, phone, full_name, last_visit_at, birthday')
    .eq('id', parsed.data.client_id)
    .eq('organization_id', user.organization_id)
    .single()

  if (!client) return { error: 'Cliente não encontrado' }
  if (!client.phone) return { error: 'Cliente sem telefone cadastrado' }

  // Busca a organização para a substituição de variáveis
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('name, address, phone, loyalty_config')
    .eq('id', user.organization_id)
    .single()

  // Busca carimbos de fidelidade
  const { data: stamps } = await supabaseAdmin
    .from('loyalty_stamps')
    .select('type, amount')
    .eq('organization_id', user.organization_id)
    .eq('client_id', parsed.data.client_id)

  let loyaltyBalance = 0
  for (const s of stamps || []) {
    if (s.type === 'redeem') loyaltyBalance = 0
    else loyaltyBalance += s.amount
  }

  const finalContent = applyTemplateVars(parsed.data.content, client, org, loyaltyBalance)

  if (!isEvolutionConfigured()) {
    return { error: 'Evolution API não configurada. Verifique as variáveis de ambiente.' }
  }

  let status: 'sent' | 'failed' = 'sent'
  let errorMsg: string | null = null

  try {
    await enviarMensagem(client.phone, finalContent)
  } catch (e) {
    status = 'failed'
    errorMsg = e instanceof Error ? e.message : 'Erro desconhecido'
  }

  const { error: dbError } = await supabaseAdmin
    .from('messages')
    .insert({
      organization_id: user.organization_id,
      client_id: parsed.data.client_id,
      channel: 'whatsapp',
      direction: 'sent',
      content: finalContent,
      template_used: parsed.data.template_used ?? null,
      status,
      error_message: errorMsg,
      sent_by: user.id,
    })

  if (dbError) {
    console.error('[SEND_MESSAGE_ACTION]', dbError.message)
    return { error: 'Erro ao salvar mensagem' }
  }

  revalidateAll()

  if (status === 'failed') {
    return { error: errorMsg ?? 'Falha ao enviar mensagem via WhatsApp' }
  }

  return { success: true }
}

/**
 * @deprecated Use sendMessageAction para envio real via Evolution API.
 * Mantido para compatibilidade com fluxos que não precisam de envio automático.
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
 * Disparo em massa: registra no banco e envia via Evolution API.
 * Insere cada mensagem como 'pending' antes de enviar, e atualiza para
 * 'sent' ou 'failed' conforme o resultado real do envio.
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

  // Busca a organização para a substituição de variáveis
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('name, address, phone, loyalty_config')
    .eq('id', user.organization_id)
    .single()

  // Busca carimbos de todos os clientes da organização
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

  // Registra todas as mensagens como 'pending' antes de disparar
  const messages = clients.map(c => ({
    organization_id: user.organization_id,
    client_id: c.id,
    channel: 'whatsapp',
    direction: 'sent' as const,
    content: applyTemplateVars(parsed.data.content, c, org, balances[c.id] || 0),
    template_used: parsed.data.template_key,
    status: 'pending' as const,
    sent_by: user.id,
  }))

  const { data: insertedRows, error } = await supabaseAdmin
    .from('messages')
    .insert(messages)
    .select('id, client_id')

  if (error || !insertedRows) {
    console.error('[RECORD_BROADCAST]', error?.message)
    Sentry.captureException(error)
    return { error: 'Erro ao registrar disparo' }
  }

  // Mapeia client_id para o message_id inserido
  const clientMsgMap = new Map<string, string>()
  insertedRows.forEach(row => {
    if (row.client_id) {
      clientMsgMap.set(row.client_id, row.id)
    }
  })

  // Envia via Evolution API em lotes de 5, com delay de 1.5s entre lotes
  let sentCount = 0
  if (isEvolutionConfigured()) {
    const BATCH_SIZE = 5
    const DELAY_MS = 1500
    const withPhone = clients.filter(c => c.phone)

    for (let i = 0; i < withPhone.length; i += BATCH_SIZE) {
      const batch = withPhone.slice(i, i + BATCH_SIZE)
      const results = await Promise.allSettled(
        batch.map(client => {
          const msg = applyTemplateVars(parsed.data.content, client, org, balances[client.id] || 0)
          return enviarMensagem(client.phone!, msg)
        })
      )

      // Atualiza o status de cada mensagem no banco
      await Promise.all(
        results.map(async (result, idx) => {
          const client = batch[idx]
          if (!client) return
          const msgId = clientMsgMap.get(client.id)
          if (!msgId) return

          if (result.status === 'fulfilled') {
            sentCount++
            await supabaseAdmin
              .from('messages')
              .update({ status: 'sent' })
              .eq('id', msgId)
          } else {
            console.error('[BROADCAST_EVOLUTION]', client.id, result.reason)
            const errorMsg = result.reason instanceof Error ? result.reason.message : 'Erro no envio'
            await supabaseAdmin
              .from('messages')
              .update({ status: 'failed', error_message: errorMsg })
              .eq('id', msgId)
          }
        })
      )

      // Delay entre lotes para evitar ban do WhatsApp
      if (i + BATCH_SIZE < withPhone.length) {
        await new Promise(r => setTimeout(r, DELAY_MS))
      }
    }
  }

  revalidateAll()
  return { success: true, count: clients.length, sentCount, clients }
}

/**
 * Cria um novo template de mensagem.
 */
export async function createTemplate(formData: FormData) {
  const user = await requireUser()
  if (user.role !== 'admin') return { error: 'Sem permissão' }

  const parsed = templateSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || null,
    trigger_type: formData.get('trigger_type'),
    content: formData.get('content'),
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos', issues: parsed.error.flatten() }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('message_templates')
    .insert({
      organization_id: user.organization_id,
      name: parsed.data.name,
      description: parsed.data.description,
      content: parsed.data.content,
      trigger_type: parsed.data.trigger_type,
      is_system: false,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[CREATE_TEMPLATE]', error.message)
    return { error: 'Erro ao criar template' }
  }

  revalidateAll()
  return { success: true, id: data.id }
}

/**
 * Atualiza um template de mensagem existente.
 */
export async function updateTemplate(formData: FormData) {
  const user = await requireUser()
  if (user.role !== 'admin') return { error: 'Sem permissão' }

  const id = formData.get('id') as string
  if (!z.string().uuid().safeParse(id).success) return { error: 'ID de template inválido' }

  const parsed = templateSchema.safeParse({
    id,
    name: formData.get('name'),
    description: formData.get('description') || null,
    trigger_type: formData.get('trigger_type'),
    content: formData.get('content'),
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos', issues: parsed.error.flatten() }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('message_templates')
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      content: parsed.data.content,
      trigger_type: parsed.data.trigger_type,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('organization_id', user.organization_id)

  if (error) {
    console.error('[UPDATE_TEMPLATE]', error.message)
    return { error: 'Erro ao atualizar template' }
  }

  revalidateAll()
  return { success: true }
}

/**
 * Duplica um template de mensagem.
 */
export async function duplicateTemplate(templateId: string) {
  if (!z.string().uuid().safeParse(templateId).success) return { error: 'ID inválido' }
  const user = await requireUser()
  if (user.role !== 'admin') return { error: 'Sem permissão' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: original, error: fetchError } = await (supabaseAdmin as any)
    .from('message_templates')
    .select('*')
    .eq('id', templateId)
    .eq('organization_id', user.organization_id)
    .single()

  if (fetchError || !original) {
    return { error: 'Template não encontrado' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('message_templates')
    .insert({
      organization_id: user.organization_id,
      name: `${original.name} (cópia)`,
      description: original.description,
      content: original.content,
      trigger_type: original.trigger_type,
      is_system: false,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[DUPLICATE_TEMPLATE]', error.message)
    return { error: 'Erro ao duplicar template' }
  }

  revalidateAll()
  return { success: true, id: data.id }
}

/**
 * Deleta um template de mensagem.
 */
export async function deleteTemplate(templateId: string) {
  if (!z.string().uuid().safeParse(templateId).success) return { error: 'ID inválido' }
  const user = await requireUser()
  if (user.role !== 'admin') return { error: 'Sem permissão' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: template } = await (supabaseAdmin as any)
    .from('message_templates')
    .select('is_system')
    .eq('id', templateId)
    .single()

  if (template?.is_system) {
    return { error: 'Templates do sistema não podem ser deletados' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('message_templates')
    .delete()
    .eq('id', templateId)
    .eq('organization_id', user.organization_id)
    .eq('is_system', false)

  if (error) {
    console.error('[DELETE_TEMPLATE]', error.message)
    return { error: 'Erro ao deletar template' }
  }

  revalidateAll()
  return { success: true }
}

/**
 * Marca as mensagens recebidas de um cliente específico como lidas.
 */
export async function markMessagesAsReadAction(clientId: string) {
  if (!z.string().uuid().safeParse(clientId).success) return { error: 'ID inválido' }
  const user = await requireUser()
  if (!['admin', 'barber'].includes(user.role)) return { error: 'Sem permissão' }

  // 1. Marca mensagens vinculadas ao clientId
  const { error: err1 } = await supabaseAdmin
    .from('messages')
    .update({ status: 'read' })
    .eq('organization_id', user.organization_id)
    .eq('client_id', clientId)
    .eq('direction', 'received')
    .neq('status', 'read')

  if (err1) {
    console.error('[MARK_READ_ERR1]', err1.message)
  }

  // 2. Busca o telefone do cliente para marcar também mensagens órfãs
  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('phone')
    .eq('id', clientId)
    .eq('organization_id', user.organization_id)
    .single()

  if (client?.phone) {
    const rawPhoneDigits = client.phone.replace(/\D/g, '')
    const cleanDigits = rawPhoneDigits.replace(/^55/, '')
    const formattedPhone = cleanDigits.length === 11
      ? `(${cleanDigits.slice(0, 2)}) ${cleanDigits.slice(2, 7)}-${cleanDigits.slice(7)}`
      : cleanDigits.length === 10
      ? `(${cleanDigits.slice(0, 2)}) ${cleanDigits.slice(2, 6)}-${cleanDigits.slice(6)}`
      : client.phone

    const { error: err2 } = await (supabaseAdmin.from('messages') as any)
      .update({ status: 'read' })
      .eq('organization_id', user.organization_id)
      .is('client_id', null)
      .eq('direction', 'received')
      .eq('sender_phone', formattedPhone)
      .neq('status', 'read')

    if (err2) {
      console.error('[MARK_READ_ERR2]', err2.message)
    }
  }

  revalidateAll()
  return { success: true }
}
