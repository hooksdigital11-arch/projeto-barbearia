'server-only'

import { cache } from 'react'
import { requireAdmin } from '@/lib/auth/require-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Organization, Service, BusinessHours } from './types'

export const getOrganizationSettings = cache(async (): Promise<Organization | null> => {
  const admin = await requireAdmin()
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .eq('id', admin.organization_id)
    .single()
  
  if (error) return null
  return data as Organization
})

export const getServices = cache(async (): Promise<Service[]> => {
  const admin = await requireAdmin()
  const { data, error } = await supabaseAdmin
    .from('services')
    .select('*')
    .eq('organization_id', admin.organization_id)
    .order('name')
  
  if (error) return []
  return data as Service[]
})

export const getBusinessHours = cache(async (orgId: string): Promise<BusinessHours | null> => {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select('business_hours')
    .eq('id', orgId)
    .single()
  
  if (error) return null
  return (data.business_hours as any) as BusinessHours
})

export const getNotificationPreferences = cache(async () => {
  const admin = await requireAdmin()
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('notification_preferences')
    .eq('id', admin.id)
    .single()
  
  if (error) return null
  return data.notification_preferences as any
})
