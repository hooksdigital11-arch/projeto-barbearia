import 'server-only'
import { cache } from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import type { 
  RevenueReport, 
  AppointmentReport, 
  ClientReport, 
  TeamReport, 
  LoyaltyReport 
} from './types'

// ─── KPIs Financeiros ─────────────────────────────────────────

export const getRevenueReport = cache(async (startDate: string, endDate: string): Promise<RevenueReport> => {
  const user  = await requireUser()
  
  // Garantir fim do dia
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select('id, price_cents, start_time, status')
    .eq('organization_id', user.organization_id)
    .eq('status', 'completed')
    .gte('start_time', startDate)
    .lte('start_time', end.toISOString())

  if (error) {
    console.error('[getRevenueReport]', error.message)
    return {
      kpis: { totalRevenue: 0, averageTicket: 0, totalComandas: 0, totalDiscounts: 0, totalRevenueChange: 0, averageTicketChange: 0, totalComandasChange: 0, totalDiscountsChange: 0 },
      chartData: [],
      paymentMethods: [],
      topServices: [],
      topProducts: [],
      barberPerformance: []
    }
  }

  const rows = data ?? []

  // KPIs
  const totalCents    = rows.reduce((s, r) => s + (r.price_cents ?? 0), 0)
  const totalRevenue  = totalCents / 100
  const totalComandas = rows.length
  const averageTicket = totalComandas > 0 ? totalRevenue / totalComandas : 0

  // Receita por dia (para gráfico)
  const byDay: Record<string, number> = {}
  for (const r of rows) {
    const day = r.start_time.split('T')[0]           // 'YYYY-MM-DD'
    byDay[day] = (byDay[day] ?? 0) + (r.price_cents ?? 0)
  }
  const chartData = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, cents]) => ({
      date: date.split('-').slice(1).reverse().join('/'),
      revenue: cents / 100,
    }))

  // Formas de pagamento — buscar se a coluna existir
  const { data: payData } = await supabaseAdmin
    .from('appointments')
    .select('payment_method, price_cents')
    .eq('organization_id', user.organization_id)
    .eq('status', 'completed')
    .gte('start_time', startDate)
    .lte('start_time', end.toISOString())
    .not('payment_method', 'is', null)

  const byMethod: Record<string, number> = {}
  for (const r of (payData ?? [])) {
    const m = r.payment_method ?? 'outros'
    byMethod[m] = (byMethod[m] ?? 0) + (r.price_cents ?? 0)
  }
  const totalMethodCents = Object.values(byMethod).reduce((s, v) => s + v, 0)
  const paymentMethods = Object.entries(byMethod).map(([method, cents]) => ({
    method,
    value:      cents / 100,
    percentage: totalMethodCents > 0
      ? Math.round((cents / totalMethodCents) * 100)
      : 0,
  }))

  return {
    kpis: {
      totalRevenue,
      averageTicket,
      totalComandas,
      totalDiscounts: 0,
      totalRevenueChange: 0,
      averageTicketChange: 0,
      totalComandasChange: 0,
      totalDiscountsChange: 0
    },
    chartData,
    paymentMethods,
    topServices: [],
    topProducts: [],
    barberPerformance: []
  }
})

// ─── Relatório de Agendamentos ────────────────────────────────

export const getAppointmentsReport = cache(async (startDate: string, endDate: string): Promise<AppointmentReport> => {
  const user  = await requireUser()
  
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select('id, status, price_cents, barber_id, start_time')
    .eq('organization_id', user.organization_id)
    .gte('start_time', startDate)
    .lte('start_time', end.toISOString())

  if (error) {
    console.error('[getAppointmentsReport]', error.message)
    return {
      kpis: { total: 0, completed: 0, cancelled: 0, noShow: 0, completionRate: 0, totalChange: 0, completedChange: 0, cancelledChange: 0, noShowChange: 0, completionRateChange: 0 },
      statusDistribution: [],
      dayOfWeekDistribution: [],
      peakHours: [],
      barberDistribution: []
    }
  }

  const rows = data ?? []
  const total = rows.length
  const completed = rows.filter(r => r.status === 'completed').length
  const cancelled = rows.filter(r => r.status === 'cancelled').length
  const noShow = rows.filter(r => r.status === 'no_show').length

  return {
    kpis: {
      total,
      completed,
      cancelled,
      noShow,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      totalChange: 0, completedChange: 0, cancelledChange: 0, noShowChange: 0, completionRateChange: 0
    },
    statusDistribution: [
      { status: 'Concluído', count: completed, color: '#10b981' },
      { status: 'Cancelado', count: cancelled, color: '#ef4444' },
      { status: 'No-show', count: noShow, color: '#f59e0b' }
    ].filter(s => s.count > 0),
    dayOfWeekDistribution: [],
    peakHours: [],
    barberDistribution: []
  }
})

// ─── Relatórios Complementares (Mantendo a Interface Intacta) ──

export const getBarberPerformance = cache(async (startDate: string, endDate: string) => {
  const user  = await requireUser()
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select(`
      id, status, price_cents, barber_id,
      barber:profiles!appointments_barber_id_fkey(id, full_name)
    `)
    .eq('organization_id', user.organization_id)
    .eq('status', 'completed')
    .gte('start_time', startDate)
    .lte('start_time', end.toISOString())

  if (error) {
    console.error('[getBarberPerformance]', error.message)
    return []
  }

  const byBarber: Record<string, {
    barberId: string
    barberName: string
    totalCents: number
    count: number
  }> = {}

  for (const r of (data ?? [])) {
    const bid  = r.barber_id
    const name = (r.barber as any)?.full_name ?? 'Desconhecido'
    if (!byBarber[bid]) {
      byBarber[bid] = { barberId: bid, barberName: name, totalCents: 0, count: 0 }
    }
    byBarber[bid].totalCents += r.price_cents ?? 0
    byBarber[bid].count      += 1
  }

  return Object.values(byBarber).map(b => ({
    barberId:     b.barberId,
    barberName:   b.barberName,
    revenue:      b.totalCents / 100,
    appointments: b.count,
    avgTicket:    b.count > 0 ? b.totalCents / 100 / b.count : 0,
  }))
})

// Funções stub para manter compatibilidade estrita com a interface de components/reports-page.tsx
export const getClientsReport = cache(async (startDate: string, endDate: string): Promise<ClientReport> => {
  return {
    kpis: { totalActive: 0, totalActiveChange: 0, newClients: 0, newClientsChange: 0, recurringClients: 0, recurringClientsChange: 0, retentionRate: 0, retentionRateChange: 0 },
    newClientsChart: [], frequencyDistribution: [], birthdays: [], topClients: []
  }
})

export const getTeamReport = cache(async (startDate: string, endDate: string): Promise<TeamReport> => {
  return { barbers: [], revenueComparison: [], weeklyEvolution: [], serviceDistribution: [] }
})

export const getLoyaltyReport = cache(async (startDate: string, endDate: string): Promise<LoyaltyReport> => {
  return {
    kpis: { activeMembers: 0, activeMembersChange: 0, redemptions: 0, redemptionsChange: 0, stampsDistributed: 0, stampsDistributedChange: 0, readyToRedeem: 0, readyToRedeemChange: 0 },
    redemptionsByMonth: [], stampsDistribution: []
  }
})

export async function getFullReport(startDate: string, endDate: string) {
  const [revenue, appointments, barbers] = await Promise.all([
    getRevenueReport(startDate, endDate),
    getAppointmentsReport(startDate, endDate),
    getBarberPerformance(startDate, endDate),
  ])
  return { revenue, appointments, barbers }
}
