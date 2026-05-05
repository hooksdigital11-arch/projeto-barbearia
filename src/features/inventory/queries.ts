'server-only'

import { cache } from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import type { InventoryItem, InventoryStats } from './types'

export const getInventory = cache(async (activeOnly = true): Promise<InventoryItem[]> => {
  const user = await requireUser()
  
  let query = supabaseAdmin
    .from('inventory')
    .select('*')
    .eq('organization_id', user.organization_id)
    .order('name', { ascending: true })

  if (activeOnly) {
    query = query.eq('active', true)
  } else {
    query = query.eq('active', false)
  }

  const { data, error } = await query
  
  if (error) {
    console.error('[GET_INVENTORY]', error.message, error.details, error.hint)
    return []
  }
  
  return data as InventoryItem[]
})

export const getInventoryStats = cache(async (): Promise<InventoryStats> => {
  const user = await requireUser()
  
  const { data, error } = await supabaseAdmin
    .from('inventory')
    .select('type, quantity, min_quantity, active')
    .eq('organization_id', user.organization_id)

  if (error) {
    console.error('[GET_INVENTORY_STATS]', error.message, error.details, error.hint)
    return { total: 0, revenda: 0, usoInterno: 0, lowStock: 0, inactive: 0 }
  }

  if (!data) return { total: 0, revenda: 0, usoInterno: 0, lowStock: 0, inactive: 0 }

  const active = data.filter(p => p.active)
  return {
    total: active.length,
    revenda: active.filter(p => p.type === 'revenda').length,
    usoInterno: active.filter(p => p.type === 'uso_interno').length,
    lowStock: active.filter(p => p.quantity <= (p.min_quantity ?? 5)).length,
    inactive: data.filter(p => !p.active).length,
  }
})
