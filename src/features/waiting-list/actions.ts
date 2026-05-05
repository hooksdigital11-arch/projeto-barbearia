'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import { joinQueueSchema } from './schemas'
import type { WhatsAppData } from './types'

const REVALIDATE_PATHS = [
  '/admin/waiting-list',
  '/barber/waiting-list',
  '/client/waiting-list',
]

function revalidateAll() {
  REVALIDATE_PATHS.forEach(path => revalidatePath(path))
}

/**
 * Entrar na fila de espera
 */
export async function joinQueue(formData: FormData) {
  const user = await requireUser()

  const parsed = joinQueueSchema.safeParse({
    client_id: formData.get('client_id'),
    service_id: formData.get('service_id'),
    barber_id: formData.get('barber_id') || null,
    phone: formData.get('phone'),
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos', issues: parsed.error.flatten() }
  }

  // Verificar se cliente já está na fila
  const { data: existing } = await supabaseAdmin
    .from('waiting_list')
    .select('id')
    .eq('organization_id', user.organization_id)
    .eq('client_id', parsed.data.client_id)
    .in('status', ['waiting', 'notified'])
    .limit(1)
    .single()

  if (existing) {
    return { error: 'Cliente já está na fila de espera' }
  }

  // Pegar última posição
  const { data: lastInQueue } = await supabaseAdmin
    .from('waiting_list')
    .select('position')
    .eq('organization_id', user.organization_id)
    .in('status', ['waiting', 'notified'])
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = (lastInQueue?.position || 0) + 1

  // Calcular tempo estimado baseado na posição e duração do serviço
  const { data: service } = await supabaseAdmin
    .from('services')
    .select('duration_minutes')
    .eq('id', parsed.data.service_id)
    .single()

  const estimatedWait = position * (service?.duration_minutes || 30)

  const { error } = await supabaseAdmin.from('waiting_list').insert({
    organization_id: user.organization_id,
    client_id: parsed.data.client_id,
    service_id: parsed.data.service_id,
    barber_id: parsed.data.barber_id,
    position,
    status: 'waiting',
    estimated_wait_minutes: estimatedWait,
    arrived_at: new Date().toISOString(),
  })

  if (error) {
    console.error('[JOIN_QUEUE]', error.message)
    return { error: 'Erro ao entrar na fila' }
  }

  revalidateAll()
  return { success: true, position }
}

/**
 * Notificar cliente de vaga disponível (admin/barbeiro)
 */
export async function notifyClient(waitingListId: string): Promise<{
  error?: string
  success?: boolean
  whatsappData?: WhatsAppData
}> {
  const user = await requireUser()
  if (!['admin', 'barber'].includes(user.role)) {
    return { error: 'Sem permissão' }
  }

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  const { data: entry, error } = await supabaseAdmin
    .from('waiting_list')
    .update({
      status: 'notified',
      called_at: new Date().toISOString(),
      expires_at: expiresAt,
      whatsapp_sent: true,
    })
    .eq('id', waitingListId)
    .eq('organization_id', user.organization_id)
    .select(`
      *,
      client:clients(full_name, phone),
      service:services(name),
      barber:profiles!waiting_list_barber_id_fkey(full_name)
    `)
    .single()

  if (error || !entry) {
    console.error('[NOTIFY_CLIENT]', error?.message)
    return { error: 'Erro ao notificar cliente' }
  }

  revalidateAll()

  const clientData = entry.client as { full_name: string; phone: string | null } | null
  const serviceData = entry.service as { name: string } | null
  const barberData = entry.barber as { full_name: string } | null

  return {
    success: true,
    whatsappData: {
      phone: clientData?.phone || null,
      clientName: clientData?.full_name || null,
      serviceName: serviceData?.name || null,
      barberName: barberData?.full_name || 'Qualquer barbeiro',
      expiresAt,
    },
  }
}

/**
 * Cliente confirma vaga
 */
export async function confirmQueueSpot(waitingListId: string) {
  const user = await requireUser()

  // Buscar entrada
  const { data: entry } = await supabaseAdmin
    .from('waiting_list')
    .select('*, expires_at, status, organization_id')
    .eq('id', waitingListId)
    .single()

  if (!entry) return { error: 'Entrada não encontrada' }
  if (entry.organization_id !== user.organization_id) return { error: 'Sem permissão' }
  if (entry.status !== 'notified') return { error: 'Vaga não disponível' }

  if (entry.expires_at && new Date(entry.expires_at) < new Date()) {
    // Auto-expirar
    await supabaseAdmin
      .from('waiting_list')
      .update({ status: 'expired' })
      .eq('id', waitingListId)

    revalidateAll()
    return { error: 'Vaga expirada. O tempo para confirmação acabou.' }
  }

  const { error } = await supabaseAdmin
    .from('waiting_list')
    .update({
      status: 'confirmed',
      served_at: new Date().toISOString(),
    })
    .eq('id', waitingListId)

  if (error) {
    console.error('[CONFIRM_SPOT]', error.message)
    return { error: 'Erro ao confirmar vaga' }
  }

  revalidateAll()
  return { success: true }
}

/**
 * Sair da fila (cliente) ou remover (admin/barbeiro)
 */
export async function leaveQueue(waitingListId: string) {
  const user = await requireUser()

  const { error } = await supabaseAdmin
    .from('waiting_list')
    .update({ status: 'left' })
    .eq('id', waitingListId)
    .eq('organization_id', user.organization_id)

  if (error) {
    console.error('[LEAVE_QUEUE]', error.message)
    return { error: 'Erro ao sair da fila' }
  }

  // Recalcular posições
  await recalculatePositions(user.organization_id)

  revalidateAll()
  return { success: true }
}

/**
 * Expirar vaga e avançar pro próximo (admin/barbeiro)
 */
export async function expireAndSkip(waitingListId: string) {
  const user = await requireUser()
  if (!['admin', 'barber'].includes(user.role)) {
    return { error: 'Sem permissão' }
  }

  // Expirar atual
  const { error } = await supabaseAdmin
    .from('waiting_list')
    .update({ status: 'expired' })
    .eq('id', waitingListId)
    .eq('organization_id', user.organization_id)

  if (error) {
    console.error('[EXPIRE_SKIP]', error.message)
    return { error: 'Erro ao pular cliente' }
  }

  await recalculatePositions(user.organization_id)

  revalidateAll()
  return { success: true }
}

/**
 * Recalcular posições após remoção/expiração
 */
async function recalculatePositions(organizationId: string) {
  const { data: remaining } = await supabaseAdmin
    .from('waiting_list')
    .select('id')
    .eq('organization_id', organizationId)
    .in('status', ['waiting', 'notified'])
    .order('position', { ascending: true })

  if (remaining) {
    for (let i = 0; i < remaining.length; i++) {
      const item = remaining[i]
      if (!item) continue
      await supabaseAdmin
        .from('waiting_list')
        .update({ position: i + 1 })
        .eq('id', item.id)
    }
  }
}
