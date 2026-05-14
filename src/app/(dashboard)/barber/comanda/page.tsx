import { Suspense } from 'react'

import { requireUser } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'
import { ComandaPageBarber } from '@/features/comanda/components/comanda-page-barber'

export default async function BarberComandaPage() {
  const user = await requireUser()
  const supabase = await createClient()

  // Fetch today's appointments for this barber
  const today = new Date().toISOString().split('T')[0]
  
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(id, full_name, phone),
      service:services(id, name, price_cents)
    `)
    .eq('barber_id', user.id)
    .eq('organization_id', user.organization_id)
    .gte('start_time', `${today}T00:00:00`)
    .lte('start_time', `${today}T23:59:59`)
    .in('status', ['scheduled', 'in_progress'])
    .order('start_time', { ascending: true })

  return (
    <ComandaPageBarber
      appointments={appointments || []}
      barber={user as any}
    />
  )
}
