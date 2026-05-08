'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import { sendMessageSchema, broadcastSchema, templateSchema } from './schemas'
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
