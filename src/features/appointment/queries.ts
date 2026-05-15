import 'server-only'
import { cache } from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import type {
  AppointmentWithRelations,
  AppointmentStats,
  ServiceOption,
  BarberOption,
  ClientOption,
} from './types'

const APPOINTMENT_SELECT = `
  id,
  organization_id,
  client_id,
  barber_id,
  service_id,
  start_time,
  end_time,
  duration_minutes,
  status,
  price_cents,
  notes,
  rating,
  created_at,
  client:clients!appointments_client_id_fkey(id, full_name, phone),
  barber:profiles!appointments_barber_id_fkey(id, full_name),
  service:services!appointments_service_id_fkey(id, name, price_cents)
`

/**
 * Agendamentos da organização com filtros de período e barbeiro.
 * Admin: todos. Barbeiro: apenas os seus.
 */
export const getAppointments = cache(async (filters?: {
  period?: 'today' | 'week' | 'month'
  barberId?: string
  status?: string
}): Promise<AppointmentWithRelations[]> => {
  const user = await requireUser()

  const now = new Date()
  let startDate: string
  let endDate: string

  if (filters?.period === 'today') {
    const todayStr = now.toISOString().split('T')[0]
    startDate = `${todayStr}T00:00:00`
    endDate = `${todayStr}T23:59:59`
  } else if (filters?.period === 'week') {
    const day = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    startDate = monday.toISOString()
    endDate = sunday.toISOString()
  } else {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    startDate = monthStart.toISOString()
    endDate = monthEnd.toISOString()
  }

  let query = supabaseAdmin
    .from('appointments')
    .select(APPOINTMENT_SELECT)
    .eq('organization_id', user.organization_id)
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .order('start_time', { ascending: true })

  // Barbeiro só vê os seus
  if (user.role === 'barber') {
    query = query.eq('barber_id', user.id)
  } else if (user.role === 'client') {
    // appointments.client_id references clients.id (not profiles.id)
    const { data: clientRow } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('organization_id', user.organization_id)
      .eq('profile_id', user.id)
      .single()
    if (!clientRow) return []
    query = query.eq('client_id', clientRow.id)
  } else if (filters?.barberId) {
    query = query.eq('barber_id', filters.barberId)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status as 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'cancelled')
  }

  const { data, error } = await query

  if (error) {
    console.error('[GET_APPOINTMENTS]', error.message)
    return []
  }

  return (data || []) as unknown as AppointmentWithRelations[]
})

/**
 * KPI stats dos agendamentos (para admin).
 */
export const getAppointmentStats = cache(async (): Promise<AppointmentStats> => {
  const user = await requireUser()

  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabaseAdmin
    .from('appointments')
    .select('id, status, price_cents, barber_id')
    .eq('organization_id', user.organization_id)
    .gte('start_time', `${today}T00:00:00`)
    .lte('start_time', `${today}T23:59:59`)

  const items = data || []

  return {
    total: items.length,
    confirmed: items.filter(i => i.status === 'scheduled').length,
    completed: items.filter(i => i.status === 'completed').length,
    cancelled: items.filter(i => i.status === 'cancelled' || i.status === 'no_show').length,
    revenue: items
      .filter(i => i.status === 'completed')
      .reduce((sum, i) => sum + (i.price_cents || 0), 0),
  }
})

/**
 * Serviços disponíveis (para dropdown de agendamento).
 */
export const getServices = cache(async (): Promise<ServiceOption[]> => {
  const user = await requireUser()

  const { data } = await supabaseAdmin
    .from('services')
    .select('id, name, price_cents, duration_minutes')
    .eq('organization_id', user.organization_id)
    .eq('is_active', true)
    .order('name', { ascending: true })

  return (data || []) as ServiceOption[]
})

/**
 * Barbeiros da organização (para dropdown).
 */
export const getBarbersForAppointment = cache(async (): Promise<BarberOption[]> => {
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
 * Clientes da organização (para autocomplete).
 */
export const getClientsForAppointment = cache(async (): Promise<ClientOption[]> => {
  const user = await requireUser()

  const { data } = await supabaseAdmin
    .from('clients')
    .select('id, full_name, phone')
    .eq('organization_id', user.organization_id)
    .neq('status', 'inactive')
    .order('full_name', { ascending: true })

  return (data || []) as ClientOption[]
})

/**
 * Verificar conflito de horário de um barbeiro.
 */
export async function checkTimeConflict(
  barberId: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): Promise<boolean> {
  const user = await requireUser()

  let query = supabaseAdmin
    .from('appointments')
    .select('id')
    .eq('organization_id', user.organization_id)
    .eq('barber_id', barberId)
    .not('status', 'in', '("cancelled","no_show")')
    .lt('start_time', endTime)
    .gt('end_time', startTime)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data } = await query
  return (data || []).length > 0
}
