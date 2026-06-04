'server-only'

import { cache } from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import type { WaitingListEntry, QueueStats, ServiceOption, BarberOption, ClientOption } from './types'

/**
 * Buscar fila de espera ativa do dia (waiting, notified, confirmed)
 */
export const getWaitingList = cache(async (): Promise<WaitingListEntry[]> => {
  const user = await requireUser()

  const { data, error } = await supabaseAdmin
    .from('waiting_list')
    .select(`
      *,
      client:clients(id, full_name, phone),
      barber:profiles!waiting_list_barber_id_fkey(id, full_name),
      service:services(id, name)
    `)
    .eq('organization_id', user.organization_id)
    .in('status', ['waiting', 'notified', 'confirmed'])
    .order('position', { ascending: true })

  if (error) {
    console.error('[GET_WAITING_LIST]', error.message)
    return []
  }

  return (data || []) as unknown as WaitingListEntry[]
})

/**
 * Buscar posição do cliente na fila
 */
export const getClientQueuePosition = cache(async (clientId: string): Promise<WaitingListEntry | null> => {
  const user = await requireUser()

  const { data, error } = await supabaseAdmin
    .from('waiting_list')
    .select(`
      *,
      service:services(id, name),
      barber:profiles!waiting_list_barber_id_fkey(id, full_name)
    `)
    .eq('organization_id', user.organization_id)
    .eq('client_id', clientId)
    .in('status', ['waiting', 'notified'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null

  return data as unknown as WaitingListEntry
})

/**
 * Stats da fila (KPI cards)
 */
export const getQueueStats = cache(async (): Promise<QueueStats> => {
  const user = await requireUser()

  const { data } = await supabaseAdmin
    .from('waiting_list')
    .select('status')
    .eq('organization_id', user.organization_id)
    .in('status', ['waiting', 'notified', 'confirmed'])

  // Horários vagos de hoje (cancelados)
  const today = new Date().toISOString().split('T')[0]
  const { count: cancelledToday } = await supabaseAdmin
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', user.organization_id)
    .eq('status', 'cancelled')
    .gte('start_time', `${today}T00:00:00`)

  return {
    waiting: data?.filter(d => d.status === 'waiting').length || 0,
    notified: data?.filter(d => d.status === 'notified').length || 0,
    confirmed: data?.filter(d => d.status === 'confirmed').length || 0,
    openSlots: cancelledToday || 0,
  }
})

/**
 * Buscar serviços disponíveis (para dropdown do modal)
 */
export const getAvailableServices = cache(async (): Promise<ServiceOption[]> => {
  const user = await requireUser()

  const { data } = await supabaseAdmin
    .from('services')
    .select('id, name')
    .eq('organization_id', user.organization_id)
    .order('name', { ascending: true })

  return (data || []) as ServiceOption[]
})

/**
 * Buscar barbeiros disponíveis (para dropdown do modal)
 */
export const getAvailableBarbers = cache(async (): Promise<BarberOption[]> => {
  const user = await requireUser()

  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name')
    .eq('organization_id', user.organization_id)
    .eq('role', 'barber')
    .order('full_name', { ascending: true })

  return (data || []) as BarberOption[]
})

/**
 * Buscar clientes da organização (para dropdown do modal — admin/barbeiro)
 */
export const getAvailableClients = cache(async (): Promise<ClientOption[]> => {
  const user = await requireUser()

  const { data } = await supabaseAdmin
    .from('clients')
    .select('id, full_name, phone')
    .eq('organization_id', user.organization_id)
    .order('full_name', { ascending: true })

  return (data || []) as ClientOption[]
})

/**
 * Buscar o client_id vinculado ao perfil logado (para clientes)
 */
export const getClientIdForProfile = cache(async (): Promise<string | null> => {
  const user = await requireUser()

  const { data: byProfile } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('organization_id', user.organization_id)
    .eq('profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (byProfile?.id) return byProfile.id

  const phoneFilter = user.phone ? `phone.eq.${user.phone}` : ''
  const emailFilter = user.email ? `email.eq.${user.email}` : ''
  const orFilter = [phoneFilter, emailFilter].filter(Boolean).join(',')

  if (orFilter) {
    const { data: matchedClient } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('organization_id', user.organization_id)
      .or(orFilter)
      .is('profile_id', null)
      .limit(1)
      .maybeSingle()

    if (matchedClient) {
      await supabaseAdmin
        .from('clients')
        .update({ profile_id: user.id })
        .eq('id', matchedClient.id)
      return matchedClient.id
    }
  }

  // Se não achar nada, cria
  const { data: newClient } = await supabaseAdmin
    .from('clients')
    .insert({
      organization_id: user.organization_id,
      profile_id: user.id,
      full_name: user.full_name || 'Cliente',
      email: user.email || null,
      phone: user.phone || null,
      status: 'active',
      total_visits: 0,
      total_spent_cents: 0
    })
    .select('id')
    .maybeSingle()

  return newClient?.id || null
})
