import 'server-only'
import { cache } from 'react'
import { requireUser } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'

interface ClientRow {
  id: string
  full_name: string | null
  total_spent_cents: number | null
  total_visits: number | null
}

interface StampRow {
  type: string
  amount: number
}

interface ClientAppointmentRow {
  id: string
  start_time: string
  status: string
  service_id: string | null
  barber_id: string | null
  services: {
    name: string | null
    duration_minutes: number | null
    price_cents: number | null
  } | null
  profiles: {
    full_name: string | null
  } | null
}

interface UpcomingAppointmentItem {
  id: string
  service: string
  date: string
  time: string
  barber: string
  price: string
}

interface HistoryAppointmentItem {
  id: string
  service: string
  date: string
  barber: string
  status: string
}

export const getClientDashboardData = cache(async () => {
  const user = await requireUser()
  const supabase = await createClient()
  
  // Get Client details
  const { data: clientData } = await supabase
    .from('clients')
    .select('id, full_name, total_spent_cents, total_visits')
    .eq('organization_id', user.organization_id)
    .eq('profile_id', user.id)
    .single()

  const clientId = (clientData as ClientRow | null)?.id

  let preferredBarber = '---'
  let loyaltyStamps = 0
  let nextAppointment = null
  let upcomingAppointments: UpcomingAppointmentItem[] = []
  let history: HistoryAppointmentItem[] = []
  
  if (clientId) {
    // Loyalty Stamps
    const { data: stampsData } = await supabase
      .from('loyalty_stamps')
      .select('type, amount')
      .eq('organization_id', user.organization_id)
      .eq('client_id', clientId)

    loyaltyStamps = ((stampsData as StampRow[] | null) || []).reduce((acc: number, s) => {
      return s.type === 'stamp' ? acc + s.amount : acc - s.amount
    }, 0)

    // Appointments
    const { data: appsData } = await supabase
      .from('appointments')
      .select('id, start_time, status, service_id, barber_id, services(name, duration_minutes, price_cents), profiles(full_name)')
      .eq('organization_id', user.organization_id)
      .eq('client_id', clientId)
      .order('start_time', { ascending: true })

    const apps = (appsData as ClientAppointmentRow[] | null || [])
    
    // Calculate preferred barber (most visits)
    const barberCounts = new Map<string, number>()
    apps.filter(a => a.status === 'completed').forEach(a => {
        const name = a.profiles?.full_name || 'Barbeiro'
        barberCounts.set(name, (barberCounts.get(name) || 0) + 1)
    })
    if (barberCounts.size > 0) {
        const sorted = Array.from(barberCounts.entries()).sort((a, b) => b[1] - a[1])
        preferredBarber = sorted[0]?.[0] || '---'
    }

    const upcoming = apps.filter(a => new Date(a.start_time) >= new Date() && !['completed', 'cancelled', 'no_show'].includes(a.status))
    const past = apps.filter(a => new Date(a.start_time) < new Date() || ['completed', 'cancelled', 'no_show'].includes(a.status))

    if (upcoming.length > 0) {
        const next = upcoming[0]
        if (next) {
            nextAppointment = new Date(next.start_time).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })
        }
    }

    upcomingAppointments = upcoming.map(a => ({
        id: a.id,
        service: a.services?.name || 'Serviço',
        date: new Date(a.start_time).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        time: new Date(a.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        barber: (a.profiles?.full_name || 'Barbeiro').split(' ')[0] ?? 'Barbeiro',
        price: `R$ ${((a.services?.price_cents || 0) / 100).toFixed(2)}`
    }))

    history = past.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()).slice(0, 5).map(a => ({
        id: a.id,
        service: a.services?.name || 'Serviço',
        date: new Date(a.start_time).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        barber: (a.profiles?.full_name || 'Barbeiro').split(' ')[0] ?? 'Barbeiro',
        status: a.status === 'completed' ? 'Concluído' : a.status === 'cancelled' ? 'Cancelado' : 'No-show'
    }))
  }

  return {
    profile: {
      name: user.full_name || (clientData as ClientRow | null)?.full_name || 'Cliente',
      avatar: user.avatar_url,
      preferredBarber,
      loyaltyStamps,
      nextAppointment
    },
    upcomingAppointments,
    history,
    lastVisit: history[0] || null,
    availableCoupons: [] as string[],
    organizationId: user.organization_id,
    clientId: clientId || null,
  }
})
