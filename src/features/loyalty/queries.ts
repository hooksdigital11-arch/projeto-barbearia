'server-only'

import { cache } from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import type { LoyaltyConfig, StampRecord, ClientLoyalty, LoyaltyStats } from './types'
import { DEFAULT_LOYALTY_CONFIG } from './types'

/**
 * Config do programa de fidelidade da org
 */
export const getLoyaltyConfig = cache(async (): Promise<LoyaltyConfig> => {
  const user = await requireUser()

  const { data } = await supabaseAdmin
    .from('organizations')
    .select('loyalty_config')
    .eq('id', user.organization_id)
    .single()

  if (!data?.loyalty_config) return DEFAULT_LOYALTY_CONFIG

  return {
    ...DEFAULT_LOYALTY_CONFIG,
    ...(data.loyalty_config as Partial<LoyaltyConfig>),
  }
})

/**
 * Carimbos/histórico de um cliente específico
 */
export const getClientStamps = cache(async (clientId: string): Promise<{ balance: number; history: StampRecord[] }> => {
  const user = await requireUser()

  const { data, error } = await supabaseAdmin
    .from('loyalty_stamps')
    .select('id, type, amount, notes, created_at, appointment_id')
    .eq('organization_id', user.organization_id)
    .eq('client_id', clientId)
    .order('created_at', { ascending: true })

  if (error || !data) {
    console.error('[GET_CLIENT_STAMPS]', error?.message)
    return { balance: 0, history: [] }
  }

  // Calcular saldo: após cada redeem, zera
  let balance = 0
  for (const stamp of data) {
    if (stamp.type === 'redeem') {
      balance = 0
    } else {
      balance += stamp.amount
    }
  }

  // Retornar histórico em ordem mais recente primeiro
  return {
    balance,
    history: [...data].reverse() as StampRecord[],
  }
})

/**
 * Todos os clientes com seus saldos de fidelidade (admin)
 */
export const getAllClientsLoyalty = cache(async (): Promise<ClientLoyalty[]> => {
  const user = await requireUser()

  const config = await getLoyaltyConfig()
  const goal = config.mode === 'stamps' ? config.stamps_required : config.points_required

  // Buscar clientes
  const { data: clients, error } = await supabaseAdmin
    .from('clients')
    .select('id, full_name, email, phone')
    .eq('organization_id', user.organization_id)

  if (error || !clients) {
    console.error('[GET_ALL_CLIENTS_LOYALTY]', error?.message)
    return []
  }

  // Buscar TODOS os stamps da org de uma vez (batch)
  const { data: allStamps } = await supabaseAdmin
    .from('loyalty_stamps')
    .select('client_id, type, amount')
    .eq('organization_id', user.organization_id)

  const stamps = allStamps || []

  // Calcular saldo por cliente
  const results: ClientLoyalty[] = clients.map(client => {
    const clientStamps = stamps.filter(s => s.client_id === client.id)
    
    let balance = 0
    for (const stamp of clientStamps) {
      if (stamp.type === 'redeem') {
        balance = 0
      } else {
        balance += stamp.amount
      }
    }

    return {
      id: client.id,
      full_name: client.full_name || 'Sem nome',
      email: client.email,
      phone: client.phone,
      balance,
      goal,
      progress: Math.min(Math.round((balance / goal) * 100), 100),
      ready: balance >= goal,
    }
  })

  // Só retornar clientes que têm algum carimbo
  return results
    .filter(c => c.balance > 0 || stamps.some(s => s.client_id === c.id))
    .sort((a, b) => b.balance - a.balance)
})

/**
 * Stats de fidelidade (admin KPI cards)
 */
export const getLoyaltyStats = cache(async (): Promise<LoyaltyStats> => {
  const user = await requireUser()

  const config = await getLoyaltyConfig()
  const goal = config.mode === 'stamps' ? config.stamps_required : config.points_required

  const allClients = await getAllClientsLoyalty()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: monthRedeems } = await supabaseAdmin
    .from('loyalty_stamps')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', user.organization_id)
    .eq('type', 'redeem')
    .gte('created_at', startOfMonth.toISOString())

  const withStamps = allClients.filter(c => c.balance > 0)
  const avgProgress = withStamps.length > 0
    ? Math.round((withStamps.reduce((sum, c) => sum + c.balance, 0) / withStamps.length) * 10) / 10
    : 0

  return {
    totalClients: allClients.length,
    readyToRedeem: allClients.filter(c => c.ready).length,
    monthRedeems: monthRedeems || 0,
    avgProgress,
    goal,
  }
})
