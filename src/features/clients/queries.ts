'server-only'

import { cache } from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import type {
  ClientRecord,
  ClientsStats,
  ClientProfile,
  AppointmentRecord,
  StampRecord,
  BarberOption,
} from './types'

/**
 * Lista de clientes da organização com busca e filtro de status
 */
export const getClients = cache(async (filters?: {
  search?: string
  status?: 'active' | 'inactive' | 'blocked'
}): Promise<ClientRecord[]> => {
  const user = await requireUser()

  let query = supabaseAdmin
    .from('clients')
    .select(`
      *,
      preferred_barber:profiles!clients_preferred_barber_id_fkey(id, full_name)
    `)
    .eq('organization_id', user.organization_id)

  if (filters?.status) {
    query = query.eq('status', filters.status)
  } else {
    query = query.neq('status', 'inactive')
  }

  if (filters?.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query.order('full_name', { ascending: true })

  if (error) {
    console.error('[GET_CLIENTS]', error.message)
    return []
  }

  return (data || []) as unknown as ClientRecord[]
})

/**
 * Stats para KPI cards
 */
export const getClientsStats = cache(async (): Promise<ClientsStats> => {
  const user = await requireUser()

  const today = new Date()
  const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const { data: clients } = await supabaseAdmin
    .from('clients')
    .select('id, status, last_visit_at, created_at, birthday')
    .eq('organization_id', user.organization_id)

  if (!clients) return { total: 0, active: 0, newThisMonth: 0, birthdaysThisWeek: 0 }

  const total = clients.filter(c => c.status === 'active').length

  const active = clients.filter(c =>
    c.status === 'active' &&
    c.last_visit_at &&
    new Date(c.last_visit_at) > sixtyDaysAgo
  ).length

  const newThisMonth = clients.filter(c =>
    new Date(c.created_at) > thirtyDaysAgo
  ).length

  // Aniversariantes dos próximos 7 dias
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const birthdaysThisWeek = clients.filter(c => {
    if (!c.birthday) return false
    const birthday = new Date(c.birthday)
    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthday.getMonth(),
      birthday.getDate()
    )
    return thisYearBirthday >= today && thisYearBirthday <= weekFromNow
  }).length

  return { total, active, newThisMonth, birthdaysThisWeek }
})

/**
 * Perfil completo do cliente com agendamentos, fidelidade e total gasto
 */
export const getClientById = cache(async (clientId: string): Promise<ClientProfile | null> => {
  const user = await requireUser()

  const { data: client, error } = await supabaseAdmin
    .from('clients')
    .select(`
      *,
      preferred_barber:profiles!clients_preferred_barber_id_fkey(id, full_name)
    `)
    .eq('id', clientId)
    .eq('organization_id', user.organization_id)
    .single()

  if (error || !client) {
    console.error('[GET_CLIENT_BY_ID]', error?.message)
    return null
  }

  // Buscar agendamentos, stamps em paralelo
  const [appointmentsResult, stampsResult] = await Promise.all([
    supabaseAdmin
      .from('appointments')
      .select(`
        id, start_time, end_time, status, price_cents,
        barber:profiles!appointments_barber_id_fkey(id, full_name),
        service:services(id, name, duration_minutes)
      `)
      .eq('organization_id', user.organization_id)
      .eq('client_id', clientId)
      .order('start_time', { ascending: false }),

    supabaseAdmin
      .from('loyalty_stamps')
      .select('id, type, amount, notes, created_at, appointment_id')
      .eq('organization_id', user.organization_id)
      .eq('client_id', clientId)
      .order('created_at', { ascending: true }),
  ])

  const appointments = (appointmentsResult.data || []) as unknown as AppointmentRecord[]
  const stamps = (stampsResult.data || []) as unknown as StampRecord[]

  const now = new Date()
  const past = appointments.filter(a =>
    new Date(a.start_time) < now && a.status === 'completed'
  )
  const upcoming = appointments.filter(a =>
    new Date(a.start_time) > now && a.status !== 'cancelled'
  )

  // Calcular saldo de fidelidade
  let stampBalance = 0
  for (const s of stamps) {
    if (s.type === 'redeem') stampBalance = 0
    else stampBalance += s.amount
  }

  // Total gasto (dos agendamentos completados)
  const totalSpentCalc = past.reduce((sum, a) => sum + (a.price_cents || 0), 0)
  const avgTicket = past.length > 0 ? Math.round(totalSpentCalc / past.length) : 0

  return {
    ...(client as unknown as ClientRecord),
    pastAppointments: past,
    upcomingAppointments: upcoming,
    stamps: [...stamps].reverse(), // Most recent first
    stampBalance,
    totalSpentCalc,
    avgTicket,
  }
})

/**
 * Barbeiros disponíveis (para dropdown no modal)
 */
export const getBarbers = cache(async (): Promise<BarberOption[]> => {
  const user = await requireUser()

  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name')
    .eq('organization_id', user.organization_id)
    .eq('role', 'barber')
    .order('full_name', { ascending: true })

  return (data || []) as BarberOption[]
})
