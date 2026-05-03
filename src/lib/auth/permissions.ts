'use server'

import { getSession } from './session'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

/**
 * Ensures the user has the 'admin' role.
 */
export async function requireAdmin() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  
  const profile = await getProfile(session.user.id)
  
  if (profile?.role !== 'admin') {
    throw new Error('Forbidden - Admin access required')
  }
  
  return profile
}

/**
 * Ensures the user has either 'admin' or 'barber' role.
 */
export async function requireBarber() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  
  const profile = await getProfile(session.user.id)
  
  if (!['admin', 'barber'].includes(profile?.role || '')) {
    throw new Error('Forbidden - Barber access required')
  }
  
  return profile
}

/**
 * Ensures the user belongs to the specified organization.
 */
export async function requireOwner(resourceOrgId: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  
  const profile = await getProfile(session.user.id)
  
  if (profile?.organization_id !== resourceOrgId) {
    throw new Error('Forbidden - Different organization access denied')
  }
  
  return profile
}

/**
 * Internal helper to fetch the user profile from Supabase.
 */
async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) return null
  return data as Profile
}
