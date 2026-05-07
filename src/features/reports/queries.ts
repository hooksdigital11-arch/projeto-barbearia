'use server'

import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-auth'
import type { 
  RevenueReport, 
  AppointmentReport, 
  ClientReport, 
  TeamReport, 
  LoyaltyReport 
} from './types'

// Helper to get previous period dates
function getPreviousPeriod(start: Date, end: Date) {
  const duration = end.getTime() - start.getTime()
  const prevEnd = new Date(start.getTime() - 1)
  const prevStart = new Date(start.getTime() - duration)
  return { start: prevStart, end: prevEnd }
}

export const getRevenueReport = cache(async (startDate: string, endDate: string): Promise<RevenueReport> => {
  const user = await requireAdmin()
  const supabase = await createClient()
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // 1. Busca agregada via Views
  const { data: revenueData } = await supabase
    .from('view_monthly_revenue' as any)
    .select('*')
    .eq('organization_id', user.organization_id)
    .gte('month', start.toISOString())
    .lte('month', end.toISOString())

  // 2. Busca performance de barbeiros para a seção financeira
  const { data: teamData } = await supabase
    .from('view_team_productivity' as any)
    .select('*')
    .eq('organization_id', user.organization_id)
    .gte('month', start.toISOString())
    .lte('month', end.toISOString())

  const items = (revenueData as any[]) || []
  const teamItems = (teamData as any[]) || []
  
  const totalRevenueCents = items.reduce((acc, item) => acc + (item.total_revenue_cents || 0), 0)
  const totalAppointments = items.reduce((acc, item) => acc + (item.total_appointments || 0), 0)

  return {
    kpis: {
      totalRevenue: totalRevenueCents / 100,
      totalRevenueChange: 0,
      averageTicket: totalAppointments > 0 ? (totalRevenueCents / totalAppointments) / 100 : 0,
      averageTicketChange: 0,
      totalComandas: totalAppointments,
      totalComandasChange: 0,
      totalDiscounts: 0,
      totalDiscountsChange: 0,
    },
    chartData: items.map(item => ({
      date: new Date(item.month).toLocaleDateString('pt-BR', { month: 'short' }),
      revenue: item.total_revenue_cents / 100
    })),
    paymentMethods: [
      { method: 'Dinheiro', value: totalRevenueCents / 100, percentage: 100 }
    ],
    topServices: [],
    barberPerformance: teamItems.map(b => ({
      barberId: b.barber_id as string,
      name: b.barber_name as string,
      avatarUrl: null,
      appointments: b.total_services as number,
      revenue: (b.total_revenue_cents || 0) / 100,
      averageTicket: (b.average_ticket_cents || 0) / 100,
      percentage: totalRevenueCents > 0 ? ((b.total_revenue_cents || 0) / totalRevenueCents) * 100 : 0
    }))
  }
})

export const getAppointmentsReport = cache(async (startDate: string, endDate: string): Promise<AppointmentReport> => {
  const user = await requireAdmin()
  const supabase = await createClient()

  // 2. Busca via View de Dashboard Diário (já agregada por dia)
  const { data } = await supabase
    .from('view_dashboard_daily' as any)
    .select('*')
    .eq('organization_id', user.organization_id)
    .gte('target_date', startDate.split('T')[0])
    .lte('target_date', endDate.split('T')[0])

  const days = (data as any[]) || []
  
  const total = days.reduce((acc, d) => acc + d.total_appointments, 0)
  const completed = days.reduce((acc, d) => acc + d.completed, 0)
  const cancelled = days.reduce((acc, d) => acc + d.canceled, 0)
  const noShow = days.reduce((acc, d) => acc + d.no_show, 0)

  return {
    kpis: {
      total,
      totalChange: 0,
      completed,
      completedChange: 0,
      cancelled,
      cancelledChange: 0,
      noShow,
      noShowChange: 0,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      completionRateChange: 0
    },
    statusDistribution: [
      { status: 'Concluído', count: completed, color: '#10b981' },
      { status: 'Cancelado', count: cancelled, color: '#ef4444' },
      { status: 'No-show', count: noShow, color: '#f59e0b' }
    ],
    dayOfWeekDistribution: [],
    peakHours: [],
    barberDistribution: []
  }
})

export const getClientsReport = cache(async (startDate: string, endDate: string): Promise<ClientReport> => {
  const user = await requireAdmin()
  const supabase = await createClient()

  // 3. Busca via View de Ranking de Clientes
  const { data: clients } = await supabase
    .from('view_client_ranking' as any)
    .select('*')
    .eq('organization_id', user.organization_id)
    .limit(10)

  return {
    kpis: {
      totalActive: clients?.length || 0,
      totalActiveChange: 0,
      newClients: 0,
      newClientsChange: 0,
      recurringClients: 0,
      recurringClientsChange: 0,
      retentionRate: 0,
      retentionRateChange: 0
    },
    newClientsChart: [],
    frequencyDistribution: [],
    birthdays: [],
    topClients: (clients as any[] || []).map(c => ({
      id: c.client_id as string,
      name: c.full_name as string,
      avatarUrl: null,
      visits: c.total_visits as number,
      totalSpent: (c.total_spent_cents || 0) / 100,
      lastVisit: c.last_visit_at as string,
      loyaltyPoints: 0
    }))
  }
})

export const getTeamReport = cache(async (startDate: string, endDate: string): Promise<TeamReport> => {
  const user = await requireAdmin()
  const supabase = await createClient()

  // 4. Busca via View de Produtividade
  const { data: performance } = await supabase
    .from('view_team_productivity' as any)
    .select('*')
    .eq('organization_id', user.organization_id)

  return {
    barbers: ((performance as any[]) || []).map(b => ({
      id: b.barber_id,
      name: b.barber_name,
      avatarUrl: null,
      appointments: b.total_services,
      revenue: b.total_revenue_cents / 100,
      rating: 5.0,
      completionRate: 100,
      cancellations: 0
    })),
    revenueComparison: [],
    weeklyEvolution: [],
    serviceDistribution: []
  }
})


export const getLoyaltyReport = cache(async (startDate: string, endDate: string): Promise<LoyaltyReport> => {
  const user = await requireAdmin()
  
  return {
    kpis: {
      activeMembers: 0,
      activeMembersChange: 0,
      redemptions: 0,
      redemptionsChange: 0,
      stampsDistributed: 0,
      stampsDistributedChange: 0,
      readyToRedeem: 0,
      readyToRedeemChange: 0
    },
    redemptionsByMonth: [],
    stampsDistribution: []
  }
})
