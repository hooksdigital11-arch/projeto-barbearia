import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/require-auth'
import type { Appointment } from './types'

// ✅ cache() = roda 1x por request, mesmo se múltiplos componentes chamarem
export const getAppointments = cache(async (): Promise<Appointment[]> => {
  const user = await requireUser() // Throw if not authed
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      duration_minutes,
      status,
      client:clients(id, name, phone),
      service:services(id, name, price_cents),
      barber:profiles(id, full_name)
    `)
    .eq('organization_id', user.organization_id)
    .order('start_time', { ascending: true })

  if (error) throw new Error('Failed to fetch appointments')
  return data as any // Type cast due to complex join
})

export const getAppointmentById = cache(async (id: string) => {
  const user = await requireUser()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .eq('organization_id', user.organization_id) // ⚠️ SEMPRE filtrar por org
    .single()

  if (error) throw new Error('Appointment not found')
  return data
})
