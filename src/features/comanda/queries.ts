'use server'
import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/require-auth'

// Buscar comanda ativa de um cliente (não paga)
export const getActiveComanda = cache(async (clientId: string) => {
  const user = await requireUser()
  const supabase = await createClient()

  const { data } = await supabase
    .from('comanda_items')
    .select(`
      *,
      client:clients(id, full_name, phone),
      barber:profiles!comanda_items_barber_id_fkey(id, full_name),
      appointment:appointments(id, start_time, status)
    `)
    .eq('organization_id', user.organization_id)
    .eq('client_id', clientId)
    .eq('paid', false)
    .order('created_at', { ascending: true })

  return data || []
})

// Histórico de comandas (admin)
export const getComandasHistory = cache(async (filters?: {
  period?: 'today' | 'week' | 'month'
  barberId?: string
}) => {
  const user = await requireUser()
  const supabase = await createClient()

  const now = new Date()
  let startDate: string

  if (filters?.period === 'today') {
    startDate = now.toISOString().split('T')[0] + 'T00:00:00'
  } else if (filters?.period === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    startDate = weekAgo.toISOString()
  } else {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    startDate = monthStart.toISOString()
  }

  let query = supabase
    .from('comanda_items')
    .select(`
      *,
      client:clients(id, full_name),
      barber:profiles!comanda_items_barber_id_fkey(id, full_name)
    `)
    .eq('organization_id', user.organization_id)
    .eq('paid', true)
    .gte('paid_at', startDate)
    .order('paid_at', { ascending: false })

  if (filters?.barberId) {
    query = query.eq('barber_id', filters.barberId)
  }

  const { data } = await query

  return data || []
})

// KPI stats de comandas (admin)
export const getComandasStats = cache(async () => {
  const user = await requireUser()
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const { data: todayItems } = await supabase
    .from('comanda_items')
    .select('total_cents,paid,client_id')
    .eq('organization_id', user.organization_id)
    .gte('created_at', `${today}T00:00:00`) as { data: { total_cents: number, paid: boolean, client_id: string }[] | null }

  const items = todayItems || []

  const revenue = items
    .filter(i => i.paid)
    .reduce((sum, i) => sum + i.total_cents, 0) || 0

  const uniqueClients = new Set(
    items.filter(i => i.paid).map(i => i.client_id)
  ).size

  const openComandas = new Set(
    items.filter(i => !i.paid).map(i => i.client_id)
  ).size

  const avgTicket = uniqueClients > 0
    ? Math.round(revenue / uniqueClients)
    : 0

  return {
    today: uniqueClients,
    open: openComandas,
    revenue,
    avgTicket,
  }
})
