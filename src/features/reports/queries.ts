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
  const { start: pStart, end: pEnd } = getPreviousPeriod(start, end)

  // Current period data
  const { data: currentItems } = await supabase
    .from('comanda_items')
    .select('*')
    .eq('organization_id', user.organization_id)
    .eq('paid', true)
    .gte('paid_at', start.toISOString())
    .lte('paid_at', end.toISOString())

  // Previous period data for KPIs
  const { data: prevItems } = await supabase
    .from('comanda_items')
    .select('*')
    .eq('organization_id', user.organization_id)
    .eq('paid', true)
    .gte('paid_at', pStart.toISOString())
    .lte('paid_at', pEnd.toISOString())

  const items = (currentItems as any[]) || []
  const pItems = (prevItems as any[]) || []

  const totalRevenue = items.reduce((acc, item) => acc + (item.total_cents || 0), 0)
  const prevRevenue = pItems.reduce((acc, item) => acc + (item.total_cents || 0), 0)
  
  const uniqueComandas = new Set(items.map(i => i.appointment_id).filter(Boolean)).size || 1
  const pUniqueComandas = new Set(pItems.map(i => i.appointment_id).filter(Boolean)).size || 1

  // Payment Methods
  const methods = ['cash', 'pix', 'credit_card', 'debit_card']
  const paymentMethods = methods.map(m => {
    const val = items.filter(i => i.payment_method === m).reduce((acc, i) => acc + (i.total_cents || 0), 0)
    return {
      method: m === 'cash' ? 'Dinheiro' : m === 'pix' ? 'PIX' : m === 'credit_card' ? 'Crédito' : 'Débito',
      value: val / 100,
      percentage: totalRevenue > 0 ? (val / totalRevenue) * 100 : 0
    }
  })

  return {
    kpis: {
      totalRevenue: totalRevenue / 100,
      totalRevenueChange: prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0,
      averageTicket: (totalRevenue / uniqueComandas) / 100,
      averageTicketChange: 0, // Placeholder
      totalComandas: uniqueComandas,
      totalComandasChange: 0,
      totalDiscounts: 0,
      totalDiscountsChange: 0,
    },
    chartData: [], // Would need complex grouping by date
    paymentMethods,
    topServices: [],
    barberPerformance: []
  }
})

export const getAppointmentsReport = cache(async (startDate: string, endDate: string): Promise<AppointmentReport> => {
  const user = await requireAdmin()
  const supabase = await createClient()

  const { data } = await supabase
    .from('appointments')
    .select('*')
    .eq('organization_id', user.organization_id)
    .gte('start_time', startDate)
    .lte('start_time', endDate)

  const appointments = (data as any[]) || []
  
  return {
    kpis: {
      total: appointments.length,
      totalChange: 0,
      completed: appointments.filter(a => a.status === 'completed').length,
      completedChange: 0,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      cancelledChange: 0,
      noShow: appointments.filter(a => a.status === 'no_show').length,
      noShowChange: 0,
      completionRate: appointments.length > 0 ? (appointments.filter(a => a.status === 'completed').length / appointments.length) * 100 : 0,
      completionRateChange: 0
    },
    statusDistribution: [
      { status: 'Concluído', count: appointments.filter(a => a.status === 'completed').length, color: '#10b981' },
      { status: 'Cancelado', count: appointments.filter(a => a.status === 'cancelled').length, color: '#ef4444' },
      { status: 'No-show', count: appointments.filter(a => a.status === 'no_show').length, color: '#f59e0b' },
      { status: 'Agendado', count: appointments.filter(a => a.status === 'scheduled').length, color: '#3b82f6' },
    ],
    dayOfWeekDistribution: [],
    peakHours: [],
    barberDistribution: []
  }
})

export const getClientsReport = cache(async (startDate: string, endDate: string): Promise<ClientReport> => {
  const user = await requireAdmin()
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('organization_id', user.organization_id)

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
    topClients: []
  }
})

export const getTeamReport = cache(async (startDate: string, endDate: string): Promise<TeamReport> => {
  const user = await requireAdmin()
  const supabase = await createClient()

  const { data: barbers } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', user.organization_id)
    .eq('role', 'barber')

  return {
    barbers: ((barbers as any[]) || []).map(b => ({
      id: b.id,
      name: b.full_name,
      avatarUrl: b.avatar_url,
      appointments: 0,
      revenue: 0,
      rating: 4.8,
      completionRate: 95,
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
