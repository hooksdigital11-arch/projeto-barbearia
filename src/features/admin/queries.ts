import 'server-only'
import { cache } from 'react'
import { requireUser } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'

// Sem cache() para permitir revalidação por searchParams de período e busca
export async function getAdminKPIs(period: string = 'month', search: string = '') {
  const user = await requireUser()
  const supabase = await createClient()
  
  const { data, error } = await (supabase as any)
    .rpc('get_admin_dashboard_kpis', {
      p_org_id: user.organization_id,
      p_period: period,
      p_search: search
    })

  if (error || !data) {
    console.error('[GET_ADMIN_KPIS] Error:', error ? JSON.stringify(error, null, 2) : 'No data returned', error?.message, error?.details)
    return {
      revenue: { value: 0, trend: 0, isPositive: true },
      appointments: { total: 0, completed: 0, pending: 0 },
      newClients: { value: 0, trend: 0, isPositive: true },
      loyaltyRedeemable: { value: 0 },
      weekly_chart: [],
      recent_activities: []
    }
  }

  const calculateTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0
    return ((curr - prev) / prev) * 100
  }

  const revenueTrend = calculateTrend(data.revenue?.current ?? 0, data.revenue?.last ?? 0)
  const clientsTrend = calculateTrend(data.clients?.current ?? 0, data.clients?.last ?? 0)

  return {
    revenue: {
      value: (data.revenue?.current || 0) / 100,
      trend: Math.abs(Math.round(revenueTrend)),
      isPositive: revenueTrend >= 0
    },
    appointments: {
      total: data.appointments?.total || 0,
      completed: data.appointments?.completed || 0,
      pending: Math.max(0, (data.appointments?.total || 0) - (data.appointments?.completed || 0) - (data.appointments?.no_show || 0))
    },
    newClients: {
      value: data.clients?.current || 0,
      trend: Math.abs(Math.round(clientsTrend)),
      isPositive: clientsTrend >= 0
    },
    loyaltyRedeemable: { value: data.loyalty?.redeemable || 0 },
    weekly_chart: data.weekly_chart || [],
    recent_activities: data.recent_activities || []
  }
}

export async function getBarbersPerformance(search: string = '') {
  const user = await requireUser()
  const supabase = await createClient()
  
  const startOfCurrentMonth = new Date()
  startOfCurrentMonth.setDate(1)
  startOfCurrentMonth.setHours(0, 0, 0, 0)

  // 2. Usando a View de Produtividade (Agregada no Banco)
  const { data, error } = await supabase
    .from('view_team_productivity' as any)
    .select('*')
    .eq('organization_id', user.organization_id)
    .eq('month', startOfCurrentMonth.toISOString())
    .ilike('barber_name', `%${search}%`)

  if (error || !data) {
    console.error('[GET_BARBERS_PERFORMANCE] Error:', error)
    return []
  }

  // Cores fixas para os barbeiros
  const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899']

  return (data as any[]).map((barber, index) => ({
    id: barber.barber_id,
    name: barber.barber_name?.split(' ')[0] || 'Barbeiro',
    avatar: null,
    appointments: barber.total_services,
    revenue: (barber.total_revenue_cents || 0) / 100,
    rating: 5.0,
    color: colors[index % colors.length]
  })).sort((a, b) => b.revenue - a.revenue)
}

