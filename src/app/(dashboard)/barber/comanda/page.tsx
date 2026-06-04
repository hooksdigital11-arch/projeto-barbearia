
import { requireBarber } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'
import { ComandaPageBarber } from '@/features/comanda/components/comanda-page-barber'
import { getClients } from '@/features/clients/queries'

export default async function BarberComandaPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; barberId?: string; clientId?: string; appointmentId?: string }>
}) {
  const params = await searchParams
  const user = await requireBarber()
  const supabase = await createClient()
  const clients = await getClients()

  // Fetch today's appointments for this barber
  const today = new Date().toISOString().split('T')[0]
  
  const [appointmentsResponse, urlAppointmentResponse] = await Promise.all([
    supabase
      .from('appointments')
      .select(`
        id,
        client_id,
        start_time,
        price_cents,
        status,
        client:clients(id, full_name, phone),
        service:services(id, name, price_cents)
      `)
      .eq('barber_id', user.id)
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
            client:clients(id, full_name, phone),
            service:services(id, name, price_cents)
          `)
          .eq('id', params.appointmentId)
          .eq('organization_id', user.organization_id)
          .maybeSingle()
      : Promise.resolve({ data: null })
  ])

  const appointments = appointmentsResponse.data || []
  const urlAppointment = urlAppointmentResponse.data

  return (
    <ComandaPageBarber
      appointments={appointments as any || []}
      clients={clients || []}
      urlAppointment={urlAppointment as any}
    />
  )
}
