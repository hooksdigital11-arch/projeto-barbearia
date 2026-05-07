'use server'

import { cache } from 'react'
import { requireUser } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'

// 1. Fetch Dashboard Stats
export const getDashboardStats = cache(async (date?: string) => {
  const user = await requireUser()
  const supabase = await createClient()
  
  const targetDate = date || new Date().toISOString().split('T')[0]

  const { data, error } = await (supabase as any)
    .rpc('get_dashboard_stats_v2', {
      p_org_id: user.organization_id,
      p_date: targetDate
    })
    .single()

  if (error) {
    console.error('Error fetching dashboard stats:', error)
    return null
  }

  return {
    revenue: (data.total_revenue_cents || 0) / 100,
    averageTicket: (data.average_ticket_cents || 0) / 100,
    appointments: {
      total: data.total_appointments || 0,
      completed: data.completed || 0,
      canceled: data.canceled || 0,
      noShow: data.no_show || 0
    }
  }
})

// 2. Fetch Reports Stats
export const getReportsStats = cache(async (startDate: Date, endDate: Date) => {
  const user = await requireUser()
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .rpc('get_reports_stats', {
      p_organization_id: user.organization_id,
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString()
    })
    .single()

  if (error) {
    console.error('Error fetching reports stats:', error)
    return null
  }

  return {
    totalRevenue: (data.total_revenue_cents || 0) / 100,
    totalAppointments: data.total_appointments || 0,
    averageTicket: (data.average_ticket_cents || 0) / 100,
    totalDiscounts: (data.total_discounts_cents || 0) / 100
  }
})

// 3. Fetch Client Stats
export const getClientStats = cache(async () => {
  const user = await requireUser()
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .rpc('get_client_stats', {
      p_organization_id: user.organization_id
    })
    .single()

  if (error) return null

  return {
    total: data.total_clients || 0,
    newThisMonth: data.new_clients_this_month || 0,
    returning: data.returning_clients || 0,
    retentionRate: data.total_clients > 0 ? Math.round((data.returning_clients / data.total_clients) * 100) : 0
  }
})

// 4. Fetch Team Performance
export const getTeamAnalytics = cache(async (startDate: Date, endDate: Date) => {
  const user = await requireUser()
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .rpc('get_team_stats', {
      p_organization_id: user.organization_id,
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
    })

  if (error || !data) {
    console.error('[GET_TEAM_ANALYTICS] Error:', error)
    return []
  }

  return (data as any[]).map(barber => ({
    id: barber.barber_id,
    name: barber.barber_name,
    appointments: barber.total_appointments,
    revenue: (barber.total_revenue_cents || 0) / 100
  }))
})
