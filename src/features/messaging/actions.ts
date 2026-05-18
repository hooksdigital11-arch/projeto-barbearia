'use server'

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
    .select('phone')
    .eq('id', parsed.data.client_id)
    .eq('organization_id', user.organization_id)
    .single()

  if (!client) return { error: 'Cliente não encontrado' }
  if (!client.phone) return { error: 'Cliente sem telefone cadastrado' }

  if (!isEvolutionConfigured()) {
    return { error: 'Evolution API não configurada. Verifique as variáveis de ambiente.' }
  }

  let status: 'sent' | 'failed' = 'sent'
  let errorMsg: string | null = null

  try {
    await enviarMensagem(client.phone, parsed.data.content)
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
      content: parsed.data.content,
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

  // Enviar via Evolution API em lotes paralelos de 5
  let sentCount = 0
  if (isEvolutionConfigured()) {
    const BATCH_SIZE = 5
    const withPhone = clients.filter(c => c.phone)

    for (let i = 0; i < withPhone.length; i += BATCH_SIZE) {
      const batch = withPhone.slice(i, i + BATCH_SIZE)
      const results = await Promise.allSettled(
        batch.map(client => {
          const msg = parsed.data.content.replace(/\{nome\}/g, client.full_name)
          return enviarMensagem(client.phone!, msg)
        })
      )
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          sentCount++
        } else {
          console.error('[BROADCAST_EVOLUTION]', batch[idx]?.id, result.reason)
        }
      })
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

  const { data: original, error: fetchError } = await (supabaseAdmin as any)
    .from('message_templates')
    .select('*')
    .eq('id', templateId)
    .eq('organization_id', user.organization_id)
    .single()

  if (fetchError || !original) {
    return { error: 'Template não encontrado' }
  }

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

  const { data: template } = await (supabaseAdmin as any)
    .from('message_templates')
    .select('is_system')
    .eq('id', templateId)
    .single()

  if (template?.is_system) {
    return { error: 'Templates do sistema não podem ser deletados' }
  }

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
