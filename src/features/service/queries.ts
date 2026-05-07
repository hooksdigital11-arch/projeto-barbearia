'server-only'

import { cache } from 'react'
import { requireUser } from '@/lib/auth/require-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Service } from './types'

/**
 * Busca todos os serviços da organização (para Admin e Barber).
 * Retorna todos incluindo inativos.
 */
export const getAllServices = cache(async (): Promise<Service[]> => {
  const user = await requireUser()

  const { data, error } = await supabaseAdmin
    .from('services')
    .select('id, organization_id, name, description, category, duration_minutes, price_cents, is_active, created_at')
    .eq('organization_id', user.organization_id)
    .order('category')
    .order('name')

  if (error) return []
  return data as Service[]
})

/**
 * Busca apenas serviços ativos (para Client / Agendamento).
 */
export const getActiveServices = cache(async (): Promise<Service[]> => {
  const user = await requireUser()

  const { data, error } = await supabaseAdmin
    .from('services')
    .select('id, organization_id, name, description, category, duration_minutes, price_cents, is_active, created_at')
    .eq('organization_id', user.organization_id)
    .eq('is_active', true)
    .order('category')
    .order('name')

  if (error) return []
  return data as Service[]
})

/**
 * Busca um único serviço por ID (com verificação de organization_id).
 */
export const getServiceById = cache(async (id: string): Promise<Service | null> => {
  const user = await requireUser()

  const { data, error } = await supabaseAdmin
    .from('services')
    .select('id, organization_id, name, description, category, duration_minutes, price_cents, is_active, created_at')
    .eq('id', id)
    .eq('organization_id', user.organization_id)
    .single()

  if (error) return null
  return data as Service
})

/**
 * Busca stats de serviços para KPIs.
 */
export const getServiceStats = cache(async () => {
  const user = await requireUser()

  const { data, error } = await supabaseAdmin
    .from('services')
    .select('id, is_active, category, price_cents')
    .eq('organization_id', user.organization_id)

  if (error || !data) return { total: 0, active: 0, inactive: 0, categories: 0 }

  const categories = new Set(data.map(s => s.category).filter(Boolean))

  return {
    total: data.length,
    active: data.filter(s => s.is_active).length,
    inactive: data.filter(s => !s.is_active).length,
    categories: categories.size,
  }
})
