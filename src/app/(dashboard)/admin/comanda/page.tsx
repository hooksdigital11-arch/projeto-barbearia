import { Suspense } from 'react'
import { getComandasHistory, getComandasStats } from '@/features/comanda/queries'
import { ComandaPageAdmin } from '@/features/comanda/components/comanda-page-admin'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-auth'
import { getClients } from '@/features/clients/queries'

export default async function AdminComandaPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; barberId?: string; clientId?: string; appointmentId?: string }>
}) {
  const params = await searchParams
  const user = await requireAdmin()
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  // Buscar dados em paralelo para evitar waterfalls
  const [barbersResponse, stats, history, clients, appointmentsResponse, urlAppointmentResponse] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name')
      .eq('organization_id', user.organization_id)
      .in('role', ['admin', 'barber']),
    getComandasStats(),
    getComandasHistory({
      period: (params.period as any) || 'today',
      barberId: params.barberId === 'all' ? undefined : params.barberId,
    }),
    getClients(),
    supabase
      .from('appointments')
      .select(`
        id,
        client_id,
        start_time,
        price_cents,
        status,
        client:clients!appointments_client_id_fkey(id, full_name, phone),
        service:services!appointments_service_id_fkey(id, name, price_cents),
        barber:profiles!appointments_barber_id_fkey(id, full_name)
      `)
      .eq('organization_id', user.organization_id)
      .gte('start_time', `${today}T00:00:00`)
      .lte('start_time', `${today}T23:59:59`)
      .in('status', ['scheduled', 'in_progress'])
      .order('start_time', { ascending: true }),
    params.appointmentId
      ? supabase
          .from('appointments')
          .select(`
            id,
            client_id,
            start_time,
            price_cents,
            status,
            client:clients!appointments_client_id_fkey(id, full_name, phone),
            service:services!appointments_service_id_fkey(id, name, price_cents),
            barber:profiles!appointments_barber_id_fkey(id, full_name)
          `)
          .eq('id', params.appointmentId)
          .maybeSingle()
      : Promise.resolve({ data: null })
  ])

  const barbers = barbersResponse.data || []
  const appointments = appointmentsResponse.data || []
  const urlAppointment = urlAppointmentResponse.data

  return (
    <Suspense fallback={<div className="animate-pulse h-[400px] bg-muted/50 rounded-lg" />}>
      <ComandaPageAdmin
        stats={stats}
        history={history}
        appointments={appointments}
        clients={clients || []}
        urlAppointment={urlAppointment}
        initialPeriod={(params.period as 'today' | 'week' | 'month') || 'today'}
      />
    </Suspense>
  )
}
