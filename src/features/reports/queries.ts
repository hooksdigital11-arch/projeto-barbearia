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

export const getRevenueReport = cache(async (startDate: string, endDate: string): Promise<RevenueReport> => {
  const user = await requireAdmin()
  const supabase = await createClient()

  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const duration = end.getTime() - start.getTime()
  const prevStart = new Date(start.getTime() - duration)
  const prevEnd = start

  const [{ data: currentData, error: currentError }, { data: prevData }] = await Promise.all([
    (supabase.rpc as any)('get_revenue_report_data', {
      p_org_id: user.organization_id,
      p_start_date: start.toISOString().split('T')[0],
      p_end_date: end.toISOString().split('T')[0]
    }),
    (supabase.rpc as any)('get_revenue_report_data', {
      p_org_id: user.organization_id,
      p_start_date: prevStart.toISOString().split('T')[0],
      p_end_date: prevEnd.toISOString().split('T')[0]
    })
  ])

  if (currentError) {
    console.error('Error fetching revenue report RPC:', currentError)
    throw new Error('Falha ao carregar relatório financeiro do banco de dados.')
  }

  const calculateTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }

  const currKpis = currentData?.kpis || {}
  const prevKpis = prevData?.kpis || {}

  const totalRevenue = currKpis.totalRevenue || 0
  const prevRevenue = prevKpis.totalRevenue || 0
  
  const averageTicket = currKpis.averageTicket || 0
  const prevAverageTicket = prevKpis.averageTicket || 0
  
  const totalComandas = currKpis.totalComandas || 0
  const prevTotalComandas = prevKpis.totalComandas || 0

  return {
    kpis: {
      totalRevenue,
      totalRevenueChange: calculateTrend(totalRevenue, prevRevenue),
      averageTicket,
      averageTicketChange: calculateTrend(averageTicket, prevAverageTicket),
      totalComandas,
      totalComandasChange: calculateTrend(totalComandas, prevTotalComandas),
      totalDiscounts: 0,
      totalDiscountsChange: 0,
    },
    chartData: currentData?.chartData || [],
    paymentMethods: currentData?.paymentMethods || [],
    topServices: currentData?.topServices || [],
    topProducts: currentData?.topProducts || [], // Top Products logic wasn't in RPC, so it will fall back to [] for now unless added
    barberPerformance: currentData?.barberPerformance || []
  }
})

export const getAppointmentsReport = cache(async (startDate: string, endDate: string): Promise<AppointmentReport> => {
  const user = await requireAdmin()
  const supabase = await createClient()

  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const duration = end.getTime() - start.getTime()
  const prevStart = new Date(start.getTime() - duration)
  const prevEnd = start

  const [{ data: currentData, error: currentError }, { data: prevData }] = await Promise.all([
    (supabase.rpc as any)('get_appointments_report_data', {
      p_org_id: user.organization_id,
      p_start_date: start.toISOString().split('T')[0],
      p_end_date: end.toISOString().split('T')[0]
    }),
    (supabase.rpc as any)('get_appointments_report_data', {
      p_org_id: user.organization_id,
      p_start_date: prevStart.toISOString().split('T')[0],
      p_end_date: prevEnd.toISOString().split('T')[0]
    })
  ])

  if (currentError) {
    console.error('Error fetching appointments report RPC:', currentError)
    throw new Error('Falha ao carregar relatório de agendamentos do banco de dados.')
  }

  const calculateTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }

  // Preenche cores pro chart de status caso o banco não tenha retornado com cor
  const defaultColors: Record<string, string> = {
    'completed': '#10b981',
    'cancelled': '#ef4444',
    'no_show': '#f59e0b',
    'pending': '#3b82f6',
    'in_progress': '#06b6d4'
  }

  const statusMap: Record<string, string> = {
    'completed': 'Concluído',
    'cancelled': 'Cancelado',
    'no_show': 'No-show',
    'pending': 'Agendado',
    'in_progress': 'Em andamento'
  }

  const rawStatus = currentData?.statusDistribution || []
  const formattedStatus = rawStatus.map((s: any) => ({
    status: statusMap[s.status] || s.status,
    count: s.count,
    color: defaultColors[s.status] || '#a0a0a0'
  }))

  const currKpis = currentData?.kpis || {}
  const prevKpis = prevData?.kpis || {}

  const total = currKpis.total || 0
  const prevTotal = prevKpis.total || 0
  
  const completed = currKpis.completed || 0
  const prevCompleted = prevKpis.completed || 0
  
  const cancelled = currKpis.cancelled || 0
  const prevCancelled = prevKpis.cancelled || 0
  
  const noShow = currKpis.noShow || 0
  const prevNoShow = prevKpis.noShow || 0

  const completionRate = total > 0 ? (completed / total) * 100 : 0
  const prevCompletionRate = prevTotal > 0 ? (prevCompleted / prevTotal) * 100 : 0

  return {
    kpis: {
      total,
      totalChange: calculateTrend(total, prevTotal),
      completed,
      completedChange: calculateTrend(completed, prevCompleted),
      cancelled,
      cancelledChange: calculateTrend(cancelled, prevCancelled),
      noShow,
      noShowChange: calculateTrend(noShow, prevNoShow),
      completionRate,
      completionRateChange: calculateTrend(completionRate, prevCompletionRate)
    },
    statusDistribution: formattedStatus,
    dayOfWeekDistribution: [], // Pode ser adicionado futuramente no RPC se necessário
    peakHours: currentData?.peakHours || [],
    barberDistribution: currentData?.barberDistribution || []
  }
})

export const getClientsReport = cache(async (startDate: string, endDate: string): Promise<ClientReport> => {
  const user = await requireAdmin()
  const supabase = await createClient()

  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const duration = end.getTime() - start.getTime()
  const prevStart = new Date(start.getTime() - duration).toISOString()
  const prevEnd = start.toISOString()

  // 1. Todos os clientes da org
  const { data: allClients } = await supabase
    .from('clients')
    .select('id, full_name, phone, birthday, total_visits, total_spent_cents, last_visit_at, created_at, status')
    .eq('organization_id', user.organization_id)
    .order('total_spent_cents', { ascending: false })

  const clients = (allClients as any[]) || []
  const activeClients = clients.filter(c => c.status === 'active')

  // Novos clientes no período
  const newClients = clients.filter(c => {
    if (!c.created_at) return false
    const d = new Date(c.created_at).getTime()
    return d >= start.getTime() && d <= end.getTime()
  })

  // Recorrentes (mais de 1 visita)
  const recurring = activeClients.filter(c => (c.total_visits || 0) > 1)

  // --- Chart: Novos Clientes por Dia ---
  const newByDate = new Map<string, number>()
  newClients.forEach(c => {
    const day = new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    newByDate.set(day, (newByDate.get(day) || 0) + 1)
  })
  const newClientsChart = Array.from(newByDate.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => {
      const [dA = 0, mA = 0] = a.date.split('/').map(Number)
      const [dB = 0, mB = 0] = b.date.split('/').map(Number)
      return mA !== mB ? mA - mB : dA - dB
    })

  // --- Chart: Frequência de Visitas ---
  const freqRanges = [
    { range: '1 visita', min: 1, max: 1 },
    { range: '2-3 visitas', min: 2, max: 3 },
    { range: '4-6 visitas', min: 4, max: 6 },
    { range: '7+ visitas', min: 7, max: Infinity },
  ]
  const frequencyDistribution = freqRanges.map(r => ({
    range: r.range,
    count: activeClients.filter(c => {
      const v = c.total_visits || 0
      return v >= r.min && v <= r.max
    }).length
  })).filter(f => f.count > 0)

  // --- Table: Aniversariantes do mês ---
  const currentMonth = new Date().getMonth() + 1
  const birthdays = clients
    .filter(c => {
      if (!c.birthday) return false
      const bMonth = new Date(c.birthday).getMonth() + 1
      return bMonth === currentMonth
    })
    .map(c => ({
      id: c.id,
      name: c.full_name,
      date: c.birthday ? new Date(c.birthday).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '',
      phone: c.phone
    }))
    .slice(0, 10)

  // --- Table: Top Clientes ---
  const topClients = activeClients.slice(0, 10).map(c => ({
    id: c.id,
    name: c.full_name,
    avatarUrl: null,
    visits: c.total_visits || 0,
    totalSpent: (c.total_spent_cents || 0) / 100,
    lastVisit: c.last_visit_at 
      ? new Date(c.last_visit_at).toLocaleDateString('pt-BR') 
      : 'Nunca',
    loyaltyPoints: 0
  }))

  // Novos clientes no período anterior
  const { data: prevNewClientsData } = await supabase
    .from('clients')
    .select('id')
    .eq('organization_id', user.organization_id)
    .gte('created_at', prevStart)
    .lt('created_at', prevEnd)

  const prevNewClientsCount = (prevNewClientsData as any[])?.length || 0

  const calculateTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }

  const retentionRate = activeClients.length > 0 ? (recurring.length / activeClients.length) * 100 : 0

  return {
    kpis: {
      totalActive: activeClients.length,
      totalActiveChange: 0, // Total acumulado não tem trend de período
      newClients: newClients.length,
      newClientsChange: calculateTrend(newClients.length, prevNewClientsCount),
      recurringClients: recurring.length,
      recurringClientsChange: 0,
      retentionRate,
      retentionRateChange: 0
    },
    newClientsChart,
    frequencyDistribution,
    birthdays,
    topClients
  }
})

export const getTeamReport = cache(async (startDate: string, endDate: string): Promise<TeamReport> => {
  const user = await requireAdmin()
  const supabase = await createClient()

  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  // 1. Busca barbeiros
  const { data: barberProfiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('organization_id', user.organization_id)
    .eq('role', 'barber')

  // 2. Busca agendamentos no período
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, barber_id, service_id, status, price_cents, start_time, rating')
    .eq('organization_id', user.organization_id)
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString())

  // 3. Busca serviços
  const { data: services } = await supabase
    .from('services')
    .select('id, name')
    .eq('organization_id', user.organization_id)

  const allBarbers = (barberProfiles as any[]) || []
  const allApps = (appointments as any[]) || []
  const serviceMap = new Map(((services as any[]) || []).map((s: any) => [s.id, s.name]))
  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899']

  // --- Cards de Barbeiros ---
  const barbers = allBarbers.map((b: any) => {
    const myApps = allApps.filter((a: any) => a.barber_id === b.id)
    const completed = myApps.filter((a: any) => a.status === 'completed')
    const cancelled = myApps.filter((a: any) => a.status === 'cancelled')
    
    // Receita vem dos agendamentos concluidos
    const revenue = completed.reduce((acc: number, c: any) => acc + (c.price_cents || 0), 0)
    
    const ratings = completed.filter((a: any) => a.rating != null).map((a: any) => a.rating as number)
    const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 5.0

    return {
      id: b.id,
      name: (b.full_name || 'Barbeiro').split(' ')[0],
      avatarUrl: null,
      appointments: myApps.length,
      revenue: revenue / 100,
      rating: Number(avgRating.toFixed(1)),
      completionRate: myApps.length > 0 ? Math.round((completed.length / myApps.length) * 100) : 0,
      cancellations: cancelled.length
    }
  }).sort((a, b) => b.revenue - a.revenue)

  // --- Chart: Comparativo de Receita ---
  const revenueComparison = barbers.map((b, i) => ({
    name: b.name,
    revenue: b.revenue,
    color: COLORS[i % COLORS.length] || '#3b82f6'
  }))

  // --- Chart: Evolução Semanal ---
  // Agrupa por semana
  const weekMap = new Map<string, Record<string, number>>()
  allApps.filter((a: any) => a.status === 'completed').forEach((a: any) => {
    const date = new Date(a.start_time)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekLabel = weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    
    const barberName = allBarbers.find((b: any) => b.id === a.barber_id)?.full_name?.split(' ')[0] || 'Outro'
    
    if (!weekMap.has(weekLabel)) {
      weekMap.set(weekLabel, { date: weekLabel as unknown as number } as Record<string, number>)
    }
    const week = weekMap.get(weekLabel)!
    week[barberName] = (week[barberName] as number || 0) + 1
  })
  const weeklyEvolution = Array.from(weekMap.values()) as { date: string; [key: string]: string | number }[]

  // --- Chart: Distribuição de Serviços por Barbeiro ---
  const svcDistMap = new Map<string, Record<string, number>>()
  allApps.filter((a: any) => a.status === 'completed').forEach((a: any) => {
    const barberName = allBarbers.find((b: any) => b.id === a.barber_id)?.full_name?.split(' ')[0] || 'Outro'
    const serviceName = serviceMap.get(a.service_id) || 'Outro'
    
    if (!svcDistMap.has(barberName)) {
      svcDistMap.set(barberName, { barberName: barberName as unknown as number } as Record<string, number>)
    }
    const entry = svcDistMap.get(barberName)!
    entry[serviceName] = (entry[serviceName] as number || 0) + 1
  })
  const serviceDistribution = Array.from(svcDistMap.values()) as { barberName: string; [key: string]: string | number }[]

  return {
    barbers,
    revenueComparison,
    weeklyEvolution,
    serviceDistribution
  }
})

export const getLoyaltyReport = cache(async (startDate: string, endDate: string): Promise<LoyaltyReport> => {
  const user = await requireAdmin()
  const supabase = await createClient()

  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const duration = end.getTime() - start.getTime()
  const prevStart = new Date(start.getTime() - duration).toISOString()
  const prevEnd = start.toISOString()

  // 1. Busca carimbos e resgates no período atual e anterior
  const [{ data: currentStamps }, { data: prevStamps }] = await Promise.all([
    supabase
      .from('loyalty_stamps')
      .select('id, client_id, type, amount, created_at')
      .eq('organization_id', user.organization_id)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString()),
    supabase
      .from('loyalty_stamps')
      .select('id, type, amount')
      .eq('organization_id', user.organization_id)
      .gte('created_at', prevStart)
      .lt('created_at', prevEnd)
  ])

  // 2. Busca todos os carimbos para calcular saldo atual dos clientes
  const { data: allStampsData } = await supabase
    .from('loyalty_stamps')
    .select('client_id, type, amount')
    .eq('organization_id', user.organization_id)

  const allStamps = (allStampsData as any[]) || []
  const currentStampsList = (currentStamps as any[]) || []
  const prevStampsList = (prevStamps as any[]) || []
  
  const stampEntries = currentStampsList.filter((s: any) => s.type === 'stamp')
  const redeemEntries = currentStampsList.filter((s: any) => s.type === 'redeem')
  
  const prevStampEntries = prevStampsList.filter((s: any) => s.type === 'stamp')
  const prevRedeemEntries = prevStampsList.filter((s: any) => s.type === 'redeem')

  // Saldo atual por cliente
  const clientBalances = new Map<string, number>()
  allStamps.forEach((s: any) => {
    const current = clientBalances.get(s.client_id) || 0
    clientBalances.set(s.client_id, s.type === 'stamp' ? current + s.amount : current - s.amount)
  })

  const activeMembers = new Set(currentStampsList.map(s => s.client_id)).size
  const prevActiveMembers = new Set(prevStampsList.map(s => s.client_id)).size
  
  const stampsDistributed = stampEntries.reduce((a, s) => a + s.amount, 0)
  const prevStampsDistributed = prevStampEntries.reduce((a, s) => a + s.amount, 0)

  const readyToRedeem = Array.from(clientBalances.values()).filter(v => v >= 10).length

  const calculateTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }

  // --- Chart: Resgates por Mês ---
  const redemptionsByMonthMap = new Map<string, number>()
  currentStampsList.filter(s => s.type === 'redeem').forEach(s => {
    const month = new Date(s.created_at).toLocaleDateString('pt-BR', { month: 'short' })
    redemptionsByMonthMap.set(month, (redemptionsByMonthMap.get(month) || 0) + 1)
  })
  const redemptionsByMonth = Array.from(redemptionsByMonthMap.entries()).map(([month, count]) => ({ month, count }))

  // --- Chart: Distribuição de Carimbos ---
  const ranges = [
    { label: '1-3 selos', min: 1, max: 3 },
    { label: '4-6 selos', min: 4, max: 6 },
    { label: '7-9 selos', min: 7, max: 9 },
    { label: 'Pronto p/ Resgate', min: 10, max: Infinity },
  ]
  const stampsDistribution = ranges.map(r => ({
    range: r.label,
    count: Array.from(clientBalances.values()).filter(v => v >= r.min && v <= r.max).length
  })).filter(f => f.count > 0)

  return {
    kpis: {
      activeMembers,
      activeMembersChange: calculateTrend(activeMembers, prevActiveMembers),
      redemptions: redeemEntries.length,
      redemptionsChange: calculateTrend(redeemEntries.length, prevRedeemEntries.length),
      stampsDistributed,
      stampsDistributedChange: calculateTrend(stampsDistributed, prevStampsDistributed),
      readyToRedeem,
      readyToRedeemChange: 0
    },
    redemptionsByMonth,
    stampsDistribution
  }
})
