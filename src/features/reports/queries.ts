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
  
  const start = startDate.split('T')[0]
  const end = endDate.split('T')[0]

  // 1. Busca agendamentos concluídos no período
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, price_cents, start_time, barber_id, service_id')
    .eq('organization_id', user.organization_id)
    .eq('status', 'completed')
    .gte('start_time', start)
    .lte('start_time', end)

  // 2. Busca comanda_items pagos para payment methods
  const { data: comandaItems } = await supabase
    .from('comanda_items')
    .select('id, total_cents, payment_method, name, quantity, item_type')
    .eq('organization_id', user.organization_id)
    .eq('paid', true)
    .gte('created_at', start)
    .lte('created_at', end)

  // 3. Busca barbeiros para nomes
  const { data: barbers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('organization_id', user.organization_id)
    .eq('role', 'barber')

  // 4. Busca serviços para nomes
  const { data: services } = await supabase
    .from('services')
    .select('id, name')
    .eq('organization_id', user.organization_id)

  const items = (appointments as any[]) || []
  const comandas = (comandaItems as any[]) || []
  const barberMap = new Map(((barbers as any[]) || []).map((b: any) => [b.id, b.full_name || 'Barbeiro']))
  const serviceMap = new Map(((services as any[]) || []).map((s: any) => [s.id, s.name]))

  const totalRevenueCents = items.reduce((acc, item) => acc + (item.price_cents || 0), 0)

  // --- Chart: Receita por Dia ---
  const revenueByDate = new Map<string, number>()
  items.forEach(item => {
    const day = new Date(item.start_time).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    revenueByDate.set(day, (revenueByDate.get(day) || 0) + (item.price_cents || 0))
  })
  const chartData = Array.from(revenueByDate.entries())
    .map(([date, cents]) => ({ date, revenue: cents / 100 }))
    .sort((a, b) => {
      const [dA = 0, mA = 0] = a.date.split('/').map(Number)
      const [dB = 0, mB = 0] = b.date.split('/').map(Number)
      return mA !== mB ? mA - mB : dA - dB
    })

  // --- Chart: Formas de Pagamento ---
  const paymentMap = new Map<string, number>()
  const methodLabels: Record<string, string> = {
    'cash': 'Dinheiro', 'pix': 'PIX', 
    'credit_card': 'Crédito', 'debit_card': 'Débito'
  }
  comandas.forEach((c: any) => {
    const label = methodLabels[c.payment_method || ''] || 'Outro'
    paymentMap.set(label, (paymentMap.get(label) || 0) + (c.total_cents || 0))
  })
  // If no comanda data, derive from appointments
  if (paymentMap.size === 0 && totalRevenueCents > 0) {
    paymentMap.set('Não especificado', totalRevenueCents)
  }
  const paymentTotal = Array.from(paymentMap.values()).reduce((a, b) => a + b, 0) || 1
  const paymentMethods = Array.from(paymentMap.entries()).map(([method, cents]) => ({
    method,
    value: cents / 100,
    percentage: (cents / paymentTotal) * 100
  }))

  // --- Chart: Top 5 Serviços ---
  const serviceCount = new Map<string, { quantity: number; revenue: number }>()
  items.forEach(item => {
    const name = serviceMap.get(item.service_id) || 'Serviço'
    const current = serviceCount.get(name) || { quantity: 0, revenue: 0 }
    serviceCount.set(name, { 
      quantity: current.quantity + 1, 
      revenue: current.revenue + (item.price_cents || 0) / 100 
    })
  })
  const topServices = Array.from(serviceCount.entries())
    .map(([name, data]) => ({ name, quantity: data.quantity, totalRevenue: data.revenue }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  // --- Table: Performance por Barbeiro ---
  const barberStats = new Map<string, { appointments: number; revenue: number }>()
  items.forEach(item => {
    const current = barberStats.get(item.barber_id) || { appointments: 0, revenue: 0 }
    barberStats.set(item.barber_id, {
      appointments: current.appointments + 1,
      revenue: current.revenue + (item.price_cents || 0)
    })
  })
  const barberPerformance = Array.from(barberStats.entries())
    .map(([barberId, stats]) => ({
      barberId,
      name: barberMap.get(barberId) || 'Barbeiro',
      avatarUrl: null,
      appointments: stats.appointments,
      revenue: stats.revenue / 100,
      averageTicket: stats.appointments > 0 ? (stats.revenue / stats.appointments) / 100 : 0,
      percentage: totalRevenueCents > 0 ? (stats.revenue / totalRevenueCents) * 100 : 0
    }))
    .sort((a, b) => b.revenue - a.revenue)

  return {
    kpis: {
      totalRevenue: totalRevenueCents / 100,
      totalRevenueChange: 0,
      averageTicket: items.length > 0 ? (totalRevenueCents / items.length) / 100 : 0,
      averageTicketChange: 0,
      totalComandas: items.length,
      totalComandasChange: 0,
      totalDiscounts: 0,
      totalDiscountsChange: 0,
    },
    chartData,
    paymentMethods,
    topServices,
    barberPerformance
  }
})

export const getAppointmentsReport = cache(async (startDate: string, endDate: string): Promise<AppointmentReport> => {
  const user = await requireAdmin()
  const supabase = await createClient()

  const start = startDate.split('T')[0]
  const end = endDate.split('T')[0]

  // Busca TODOS os agendamentos no período (todos os status)
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, status, start_time, barber_id')
    .eq('organization_id', user.organization_id)
    .gte('start_time', start)
    .lte('start_time', end)

  // Busca barbeiros
  const { data: barbers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('organization_id', user.organization_id)
    .eq('role', 'barber')

  const items = (appointments as any[]) || []
  const barberMap = new Map(((barbers as any[]) || []).map((b: any) => [b.id, b.full_name || 'Barbeiro']))

  const total = items.length
  const completed = items.filter(a => a.status === 'completed').length
  const cancelled = items.filter(a => a.status === 'cancelled').length
  const noShow = items.filter(a => a.status === 'no_show').length

  // --- Chart: Status Distribution ---
  const statusDistribution = [
    { status: 'Concluído', count: completed, color: '#10b981' },
    { status: 'Cancelado', count: cancelled, color: '#ef4444' },
    { status: 'No-show', count: noShow, color: '#f59e0b' },
    { status: 'Agendado', count: total - completed - cancelled - noShow, color: '#3b82f6' },
  ].filter(s => s.count > 0)

  // --- Chart: Distribuição por Dia da Semana ---
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const dayCounts = new Array(7).fill(0)
  items.forEach(item => {
    const dayIndex = new Date(item.start_time).getDay()
    dayCounts[dayIndex]++
  })
  const dayOfWeekDistribution = dayNames.map((day, i) => ({ day, count: dayCounts[i] }))

  // --- Chart: Horários de Pico ---
  const hourCounts = new Map<string, number>()
  items.forEach(item => {
    const hour = new Date(item.start_time).getHours()
    const label = `${hour.toString().padStart(2, '0')}:00`
    hourCounts.set(label, (hourCounts.get(label) || 0) + 1)
  })
  const peakHours = Array.from(hourCounts.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour))

  // --- Chart: Agendamentos por Barbeiro ---
  const barberCounts = new Map<string, number>()
  items.forEach(item => {
    const name = barberMap.get(item.barber_id) || 'Barbeiro'
    barberCounts.set(name, (barberCounts.get(name) || 0) + 1)
  })
  const barberDistribution = Array.from(barberCounts.entries())
    .map(([barberName, count]) => ({ barberName, count }))
    .sort((a, b) => b.count - a.count)

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
    statusDistribution,
    dayOfWeekDistribution,
    peakHours,
    barberDistribution
  }
})

export const getClientsReport = cache(async (startDate: string, endDate: string): Promise<ClientReport> => {
  const user = await requireAdmin()
  const supabase = await createClient()

  const start = startDate.split('T')[0]
  const end = endDate.split('T')[0]

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
    const created = c.created_at?.split('T')[0]
    return created && created >= start! && created <= end!
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

  return {
    kpis: {
      totalActive: activeClients.length,
      totalActiveChange: 0,
      newClients: newClients.length,
      newClientsChange: 0,
      recurringClients: recurring.length,
      recurringClientsChange: 0,
      retentionRate: activeClients.length > 0 
        ? (recurring.length / activeClients.length) * 100 
        : 0,
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

  const start = startDate.split('T')[0]
  const end = endDate.split('T')[0]

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
    .gte('start_time', start)
    .lte('start_time', end)

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
    const revenue = completed.reduce((acc: number, a: any) => acc + (a.price_cents || 0), 0)
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

  const { data: stamps } = await supabase
    .from('loyalty_stamps')
    .select('id, client_id, type, amount, created_at')
    .eq('organization_id', user.organization_id)

  const allStamps = (stamps as any[]) || []
  const stampEntries = allStamps.filter((s: any) => s.type === 'stamp')
  const redeemEntries = allStamps.filter((s: any) => s.type === 'redeem')
  
  // Unique clients with stamps
  const clientStamps = new Map<string, number>()
  stampEntries.forEach((s: any) => {
    clientStamps.set(s.client_id, (clientStamps.get(s.client_id) || 0) + s.amount)
  })
  redeemEntries.forEach((s: any) => {
    clientStamps.set(s.client_id, (clientStamps.get(s.client_id) || 0) - s.amount)
  })

  const readyToRedeem = Array.from(clientStamps.values()).filter(v => v >= 10).length

  return {
    kpis: {
      activeMembers: clientStamps.size,
      activeMembersChange: 0,
      redemptions: redeemEntries.length,
      redemptionsChange: 0,
      stampsDistributed: stampEntries.reduce((a: number, s: any) => a + s.amount, 0),
      stampsDistributedChange: 0,
      readyToRedeem,
      readyToRedeemChange: 0
    },
    redemptionsByMonth: [],
    stampsDistribution: []
  }
})
