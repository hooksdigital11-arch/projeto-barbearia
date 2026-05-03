'server-only'

import { cache } from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-auth'
import type { AdminUser, AdminUsersFilter } from './types'

/**
 * Busca todos os usuários da organização do administrador logado.
 * Suporta filtros por role, status e busca textual.
 */
export const getOrganizationUsers = cache(async (filters?: AdminUsersFilter): Promise<AdminUser[]> => {
  const admin = await requireAdmin()
  
  let query = supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('organization_id', admin.organization_id)

  if (filters?.role && filters.role !== 'all') {
    query = query.eq('role', filters.role)
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    // Filtro simples por nome ou email (se existir no profile)
    query = query.or(`full_name.ilike.%${filters.search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organization users:', error)
    return []
  }

  return data as AdminUser[]
})

/**
 * Busca um usuário específico pelo ID, garantindo que pertença à mesma organização.
 */
export const getUserById = cache(async (id: string): Promise<AdminUser | null> => {
  const admin = await requireAdmin()
  
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('organization_id', admin.organization_id)
    .single()

  if (error) return null

  return data as AdminUser
})
