'server-only'

import { cache } from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import type { TeamMember, TeamMemberWithStats, TeamStats, BarberPerformance, ScheduleItem } from './types'

/**
 * Buscar todos os barbeiros + admins da organização
 */
export const getTeam = cache(async (): Promise<TeamMember[]> => {
  const user = await requireUser()

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('organization_id', user.organization_id)
    .in('role', ['barber', 'admin'])
    .order('full_name', { ascending: true })

  if (error) {
    console.error('[GET_TEAM]', error.message)
    return []
  }

  return (data || []) as TeamMember[]
})

/**
 * Buscar equipe com estatísticas de performance
 */
export const getTeamWithStats = cache(async (): Promise<TeamMemberWithStats[]> => {
  const user = await requireUser()

  const today = new Date().toISOString().split('T')[0] || ''
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  // Buscar barbeiros
  const { data: barbers, error: barbersError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('organization_id', user.organization_id)
    .in('role', ['barber', 'admin'])
    .order('full_name', { ascending: true })

  if (barbersError || !barbers) {
    console.error('[GET_TEAM_WITH_STATS]', barbersError?.message)
    return []
  }

  // Buscar todos os appointments do mês para a org
  const { data: appointments } = await supabaseAdmin
    .from('appointments')
    .select('barber_id, status, price_cents, rating, start_time')
    .eq('organization_id', user.organization_id)
    .gte('start_time', monthStart)

  const allAppointments = appointments || []

  return barbers.map(barber => {
    const barberAppointments = allAppointments.filter(a => a.barber_id === barber.id)
    const todayAppointments = barberAppointments.filter(a => 
      a.start_time?.startsWith(today)
    )
    const completedMonth = barberAppointments.filter(a => a.status === 'completed')
    const monthRevenue = completedMonth.reduce((sum, a) => sum + (a.price_cents || 0), 0)
    const ratings = barberAppointments.filter(a => a.rating).map(a => a.rating!)
    const avgRating = ratings.length > 0
      ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
      : 0

    return {
      ...barber,
      todayAppointments: todayAppointments.length,
      monthRevenue,
      avgRating,
      totalCompleted: completedMonth.length,
    } as TeamMemberWithStats
  })
})

/**
 * KPI stats gerais da equipe
 */
export const getTeamStats = cache(async (): Promise<TeamStats> => {
  const user = await requireUser()

  const today = new Date().toISOString().split('T')[0] || ''

  const { data: barbers } = await supabaseAdmin
    .from('profiles')
    .select('id, status')
    .eq('organization_id', user.organization_id)
    .in('role', ['barber', 'admin'])

  const { count: todayAppointments } = await supabaseAdmin
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', user.organization_id)
    .gte('start_time', `${today}T00:00:00`)
    .lt('start_time', `${today}T23:59:59`)

  const { data: ratings } = await supabaseAdmin
    .from('appointments')
    .select('rating')
    .eq('organization_id', user.organization_id)
    .not('rating', 'is', null)

  const avgRating = ratings && ratings.length > 0
    ? Math.round((ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length) * 10) / 10
    : 0

  return {
    total: barbers?.length || 0,
    active: barbers?.filter(b => (b as Record<string, unknown>).status === 'active' || !(b as Record<string, unknown>).status).length || 0,
    todayAppointments: todayAppointments || 0,
    avgRating,
  }
})

/**
 * Performance de um barbeiro por período
 */
export const getBarberPerformance = cache(async (
  barberId: string,
  period: 'today' | 'week' | 'month' = 'month'
): Promise<BarberPerformance> => {
  const user = await requireUser()

  const now = new Date()
  let startDate: string

  if (period === 'today') {
    startDate = (now.toISOString().split('T')[0] || '') + 'T00:00:00'
  } else if (period === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    startDate = weekAgo.toISOString()
  } else {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    startDate = monthStart.toISOString()
  }

  const { data: appointments } = await supabaseAdmin
    .from('appointments')
    .select('id, status, price_cents, rating, start_time')
    .eq('organization_id', user.organization_id)
    .eq('barber_id', barberId)
    .gte('start_time', startDate)

  const total = appointments?.length || 0
  const completed = appointments?.filter(a => a.status === 'completed').length || 0
  const revenue = appointments
    ?.filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + (a.price_cents || 0), 0) || 0
  const ratings = appointments?.filter(a => a.rating).map(a => a.rating!) || []
  const avgRating = ratings.length > 0
    ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10
    : 0

  return {
    total,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    revenue,
    avgRating,
  }
})

/**
 * Agenda do dia de um barbeiro
 */
export const getBarberTodaySchedule = cache(async (barberId: string): Promise<ScheduleItem[]> => {
  const user = await requireUser()

  const today = new Date().toISOString().split('T')[0] || ''

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select('id, start_time, end_time, status, client_id, service_id')
    .eq('organization_id', user.organization_id)
    .eq('barber_id', barberId)
    .gte('start_time', `${today}T00:00:00`)
    .lt('start_time', `${today}T23:59:59`)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('[GET_BARBER_SCHEDULE]', error.message)
    return []
  }

  return (data || []).map(item => ({
    id: item.id,
    start_time: item.start_time,
    end_time: item.end_time,
    status: item.status,
    client_name: null,
    service_name: null,
  }))
})
