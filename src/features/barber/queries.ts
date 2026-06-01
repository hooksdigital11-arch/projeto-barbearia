import 'server-only'
import { cache } from 'react'
import { requireBarber } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Profile } from '@/types/database'

interface ServiceItem {
  id: string
  name: string
  duration_minutes: number | null
}

interface DashboardAppointment {
  id: string
  start_time: string
  end_time: string
  status: string
  price_cents: number | null
  client_id: string | null
  client_name: string | null
  service_id: string | null
  clients: {
    full_name: string | null
    total_visits: number | null
    total_spent_cents: number | null
    rating: number | null
    notes: string | null
  } | null
}

interface WaitingDataRow {
  id: string
  client_id: string | null
  client_name: string | null
  service_id: string | null
  status: string
  joined_at: string
  estimated_time: string | null
  clients: {
    full_name: string | null
  } | null
}

export const getBarberDashboardData = cache(async () => {
  const user = await requireBarber()
  const supabase = await createClient()
  
  // Fetch barber shift status from profile
  const { data: profileData } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  const profile = profileData as unknown as Profile | null
  const isInactive = profile?.status === 'inactive'

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)


  // 1. Appointments for today
  const { data: appointmentsData } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      end_time,
      status,
      price_cents,
      client_id,
      client_name,
      service_id,
      clients ( full_name, total_visits, total_spent_cents, rating, notes )
    `)
    .eq('organization_id', user.organization_id)
    .eq('barber_id', user.id)
    .gte('start_time', todayStart.toISOString())
    .lte('start_time', todayEnd.toISOString())
    .order('start_time', { ascending: true })

  // 2. Services map
  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_minutes')
    .eq('organization_id', user.organization_id)

  const serviceMap = new Map(((services as ServiceItem[] | null) || []).map((s) => [s.id, s]))

  const allApps = (appointmentsData as DashboardAppointment[] | null) || []
  
  const completedApps = allApps.filter(a => a.status === 'completed')
  const inProgressApps = allApps.filter(a => a.status === 'in_progress')
  
  const revenueDayCents = completedApps.reduce((sum, a) => sum + (a.price_cents || 0), 0)

  // Format appointments for timeline
  const formattedAppointments = allApps.map(a => {
    const srv = serviceMap.get(a.service_id || '')
    const startTime = new Date(a.start_time)
    
    // Determine status for UI
    let uiStatus = a.status
    if (a.status === 'scheduled') {
        // If it's the next scheduled appointment
        const firstScheduled = allApps.find(app => app.status === 'scheduled')
        if (firstScheduled && firstScheduled.id === a.id) {
            uiStatus = 'next'
        }
    }

    return {
      id: a.id,
      time: startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      client: a.clients?.full_name || a.client_name || 'Cliente',
      client_id: a.client_id,
      service: srv?.name || 'Serviço',
      duration: srv ? `${srv.duration_minutes} min` : '30 min',
      status: uiStatus
    }
  })

  // Current client details
  let currentClient = null
  if (inProgressApps.length > 0) {
    const activeApp = inProgressApps[0]
    if (activeApp) {
      const srv = serviceMap.get(activeApp.service_id || '')
      const clientData = activeApp.clients
      
      const startTime = new Date(activeApp.start_time)
      const elapsedMinutes = Math.floor((new Date().getTime() - startTime.getTime()) / 60000)

      currentClient = {
        name: clientData?.full_name || activeApp.client_name || 'Cliente',
        todayService: srv?.name || 'Serviço',
        visits: clientData?.total_visits || 1,
        rating: clientData?.rating || 5.0,
        totalSpent: (clientData?.total_spent_cents || 0) / 100,
        lastNote: clientData?.notes || '',
        elapsedMinutes: Math.max(0, elapsedMinutes)
      }
    }
  }

  // 3. Waiting List
  const { data: waitingData } = await supabase
    .from('waiting_list')
    .select('id, client_id, client_name, service_id, status, joined_at, estimated_time, clients(full_name)')
    .eq('organization_id', user.organization_id)
    .in('status', ['waiting', 'notified'])
    .order('joined_at', { ascending: true })

  const waitingList = ((waitingData as WaitingDataRow[] | null) || []).map(w => {
    const srv = serviceMap.get(w.service_id || '')
    const joined = new Date(w.joined_at)
    const waitingMins = Math.floor((new Date().getTime() - joined.getTime()) / 60000)
    
    return {
      id: w.id,
      name: w.clients?.full_name || w.client_name || 'Cliente',
      service: srv?.name || 'Serviço',
      waitingTime: `${waitingMins} min`
    }
  })

  return {
    status: isInactive 
      ? 'Fora de Serviço' 
      : inProgressApps.length > 0 
        ? 'Em Atendimento' 
        : 'Disponível',
    shift: isInactive ? 'Turno Finalizado' : '09:00 - 18:00',
    stats: { 
        revenueDay: revenueDayCents / 100, 
        appointmentsCompleted: completedApps.length, 
        appointmentsCurrent: allApps.length 
    },
    currentClient,
    appointments: formattedAppointments,
    waitingList
  }
})
