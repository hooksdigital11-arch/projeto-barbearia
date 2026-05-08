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
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)
  
  const diffTime = end.getTime() - start.getTime()
  const prevEnd = new Date(start.getTime() - 1)
  const prevStart = new Date(prevEnd.getTime() - diffTime)

  // Fetch current appointments (services)
  const { data: currApps, error: appsError } = await supabaseAdmin
    .from('appointments')
    .select('id, price_cents, start_time, status, barber_id, service_id, barber:profiles!appointments_barber_id_fkey(full_name), service:services(name)')
    .eq('organization_id', user.organization_id)
    .eq('status', 'completed')
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString())
    
  if (appsError) console.error('[currApps error]', appsError)

  // Fetch previous appointments
  const { data: prevApps } = await supabaseAdmin
    .from('appointments')
    .select('price_cents')
    .eq('organization_id', user.organization_id)
    .eq('status', 'completed')
    .gte('start_time', prevStart.toISOString())
    .lte('start_time', prevEnd.toISOString())

  // Fetch current inventory_movements (products)
  const { data: currInv } = await (supabaseAdmin as any)
    .from('inventory_movements')
    .select('inventory_id, type, quantity, unit_price_cents, created_at, inventory(name, category)')
    .eq('organization_id', user.organization_id)
    .in('type', ['venda', 'uso_interno'])
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())

  // Fetch previous inventory_movements (sales only for revenue)
  const { data: prevInv } = await (supabaseAdmin as any)
    .from('inventory_movements')
    .select('quantity, unit_price_cents')
    .eq('organization_id', user.organization_id)
    .eq('type', 'venda')
    .gte('created_at', prevStart.toISOString())
    .lte('created_at', prevEnd.toISOString())

  // Fetch payment methods from comanda_items
  const { data: payData } = await (supabaseAdmin as any)
    .from('comanda_items')
    .select('payment_method, total_cents')
    .eq('organization_id', user.organization_id)
    .eq('paid', true)
    .gte('paid_at', start.toISOString())
    .lte('paid_at', end.toISOString())

  // ---- Process Current Appointments ----
  const rows = (currApps ?? []) as any[]
  let serviceRevenueCents = 0
  const byDay: Record<string, number> = {}
  const barberMap: Record<string, { name: string, cents: number, count: number }> = {}
  const serviceMap: Record<string, { name: string, count: number }> = {}
  const byMethod: Record<string, number> = {}

  // Process payment methods
  for (const p of (payData ?? [])) {
    const m = p.payment_method ?? 'outros'
    byMethod[m] = (byMethod[m] ?? 0) + (p.total_cents ?? 0)
  }

  for (const r of rows) {
    const price = r.price_cents ?? 0
    serviceRevenueCents += price
    
    // Gráfico
    const day = r.start_time.split('T')[0]
    byDay[day] = (byDay[day] ?? 0) + price

    // Barbeiros
    const bid = r.barber_id
    if (bid) {
      if (!barberMap[bid]) barberMap[bid] = { name: (r.barber as any)?.full_name || 'Desconhecido', cents: 0, count: 0 }
      barberMap[bid].cents += price
      barberMap[bid].count += 1
    }

    // Serviços
    const sid = r.service_id
    if (sid) {
      if (!serviceMap[sid]) serviceMap[sid] = { name: (r.service as any)?.name || 'Serviço', count: 0 }
      serviceMap[sid].count += 1
    }
  }

  // ---- Process Current Inventory ----
  const invRows = currInv ?? []
  let productRevenueCents = 0
  const productMap: Record<string, { name: string, category: string, qty: number, rev: number }> = {}
  const consumedStockMap: Record<string, { inventoryId: string, name: string, category: string, type: 'venda'|'uso_interno', qtdSaida: number }> = {}

  for (const r of invRows) {
    const qty = r.quantity ?? 0
    const price = r.unit_price_cents ?? 0
    const name = r.inventory?.name || 'Produto Excluído'
    const cat = r.inventory?.category || 'Geral'
    
    if (r.type === 'venda' && r.inventory_id) {
      const rev = qty * price
      productRevenueCents += rev
      // Gráfico (add product revenue to byDay)
      const day = r.created_at.split('T')[0]
      byDay[day] = (byDay[day] ?? 0) + rev
      
      // Top products
      let prod = productMap[r.inventory_id]
      if (!prod) {
        prod = { name, category: cat, qty: 0, rev: 0 }
        productMap[r.inventory_id] = prod
      }
      prod.qty += qty
      prod.rev += rev
    }

    // Consumed Stock (venda + uso_interno)
    if (r.inventory_id) {
      const consumedKey = `${r.inventory_id}-${r.type}`
      let consumed = consumedStockMap[consumedKey]
      if (!consumed) {
        consumed = { inventoryId: r.inventory_id, name, category: cat, type: r.type as 'venda' | 'uso_interno', qtdSaida: 0 }
        consumedStockMap[consumedKey] = consumed
      }
      consumed.qtdSaida += qty
    }
  }

  // ---- Previous Period calculations ----
  const prevServiceRevenueCents = (prevApps ?? []).reduce((acc: number, r: any) => acc + (r.price_cents ?? 0), 0)
  const prevProductRevenueCents = (prevInv ?? []).reduce((acc: number, r: any) => acc + ((r.quantity ?? 0) * (r.unit_price_cents ?? 0)), 0)

  const totalRevenue = (serviceRevenueCents + productRevenueCents) / 100
  const prevTotalRevenue = (prevServiceRevenueCents + prevProductRevenueCents) / 100
  const serviceRevenue = serviceRevenueCents / 100
  const prevServiceRevenue = prevServiceRevenueCents / 100
  const productRevenue = productRevenueCents / 100
  const prevProductRevenue = prevProductRevenueCents / 100

  const totalComandas = rows.length
  const averageTicket = totalComandas > 0 ? totalRevenue / totalComandas : 0

  const calcChange = (curr: number, prev: number) => prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100

  const chartData = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, cents]) => ({
      date: date.split('-').slice(1).reverse().join('/'),
      revenue: cents / 100,
    }))

  const barberPerformance = Object.entries(barberMap).map(([id, b]) => ({
    barberId: id,
    name: b.name,
    avatarUrl: null,
    revenue: b.cents / 100,
    appointments: b.count,
    percentage: totalRevenue > 0 ? Math.round(((b.cents / 100) / totalRevenue) * 100) : 0,
    averageTicket: b.count > 0 ? (b.cents / 100) / b.count : 0
  })).sort((a, b) => b.revenue - a.revenue)

  const topServices = Object.entries(serviceMap).map(([id, s]) => ({
    name: s.name,
    quantity: s.count,
    totalRevenue: 0
  })).sort((a, b) => b.quantity - a.quantity).slice(0, 5)

  const topProducts = Object.values(productMap)
    .map(p => ({
      name: p.name,
      category: p.category,
      quantity: p.qty,
      totalRevenue: p.rev / 100
    })).sort((a, b) => b.quantity - a.quantity).slice(0, 5)

  const consumedStock = Object.values(consumedStockMap).sort((a, b) => b.qtdSaida - a.qtdSaida)

  const totalMethodCents = Object.values(byMethod).reduce((s, v) => s + v, 0)
  const paymentMethods = Object.entries(byMethod).map(([method, cents]) => ({
    method,
    value: cents / 100,
    percentage: totalMethodCents > 0 ? Math.round((cents / totalMethodCents) * 100) : 0,
  }))

  return {
    kpis: {
      totalRevenue,
      totalRevenueChange: calcChange(totalRevenue, prevTotalRevenue),
      serviceRevenue,
      serviceRevenueChange: calcChange(serviceRevenue, prevServiceRevenue),
      productRevenue,
      productRevenueChange: calcChange(productRevenue, prevProductRevenue),
      averageTicket,
      averageTicketChange: 0,
      totalComandas,
      totalComandasChange: 0,
      totalDiscounts: 0,
      totalDiscountsChange: 0
    },
    chartData,
    paymentMethods,
    topServices,
    topProducts,
    barberPerformance,
    consumedStock
  }
})

// ─── Relatório de Agendamentos ────────────────────────────────

export const getAppointmentsReport = cache(async (startDate: string, endDate: string): Promise<AppointmentReport> => {
  const user  = await requireUser()
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select('id, status, price_cents, barber_id, start_time, barber:profiles!appointments_barber_id_fkey(full_name)')
    .eq('organization_id', user.organization_id)
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString())

  if (error) {
    console.error('[getAppointmentsReport]', error.message)
    return {
      kpis: { total: 0, completed: 0, cancelled: 0, noShow: 0, completionRate: 0, totalChange: 0, completedChange: 0, cancelledChange: 0, noShowChange: 0, completionRateChange: 0 },
      statusDistribution: [], dayOfWeekDistribution: [], peakHours: [], barberDistribution: []
    }
  }

  const rows = data ?? []
  const total = rows.length
  const completed = rows.filter(r => r.status === 'completed').length
  const cancelled = rows.filter(r => r.status === 'cancelled').length
  const noShow = rows.filter(r => r.status === 'no_show').length

  // Distribution by day of week
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const dayMap: Record<string, number> = {}
  days.forEach(d => dayMap[d] = 0)
  
  // Peak Hours
  const hourMap: Record<string, number> = {}
  for(let i=7; i<=22; i++) hourMap[`${i}h`] = 0

  // Barber Distribution
  const barberDistMap: Record<string, number> = {}

  rows.forEach(r => {
    const d = new Date(r.start_time)
    const dayLabel = days[d.getDay()]!
    dayMap[dayLabel] = (dayMap[dayLabel] || 0) + 1

    const hourLabel = `${d.getHours()}h`
    if (hourMap[hourLabel] !== undefined) hourMap[hourLabel]! += 1

    const bName = (r.barber as any)?.full_name || 'Desconhecido'
    barberDistMap[bName] = (barberDistMap[bName] || 0) + 1
  })

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
    dayOfWeekDistribution: days.map(day => ({ day, count: dayMap[day] || 0 })),
    peakHours: Object.entries(hourMap).map(([hour, count]) => ({ hour, count })),
    barberDistribution: Object.entries(barberDistMap).map(([barberName, count]) => ({ barberName, count }))
  }
})

// ─── Relatório de Clientes ────────────────────────────────────

export const getClientsReport = cache(async (startDate: string, endDate: string): Promise<ClientReport> => {
  const user = await requireUser()
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  // Fetch all clients of the organization
  const { data: clients } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, created_at')
    .eq('organization_id', user.organization_id)
    .eq('role', 'client')

  // Fetch appointments to calculate visits and retention
  const { data: apps } = await supabaseAdmin
    .from('appointments')
    .select('client_id, status, price_cents, start_time')
    .eq('organization_id', user.organization_id)
    .eq('status', 'completed')
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString())

  const allClients = clients ?? []
  const currentApps = apps ?? []

  // KPIs
  const totalActive = allClients.length
  const newClients = allClients.filter(c => {
    const d = new Date(c.created_at)
    return d >= start && d <= end
  }).length

  const visitCounts: Record<string, number> = {}
  const spentCounts: Record<string, number> = {}
  currentApps.forEach(a => {
    if (a.client_id) {
      visitCounts[a.client_id] = (visitCounts[a.client_id] || 0) + 1
      spentCounts[a.client_id] = (spentCounts[a.client_id] || 0) + (a.price_cents || 0)
    }
  })

  const recurringClients = Object.values(visitCounts).filter(v => v > 1).length

  // New Clients Chart (by day)
  const dailyNew: Record<string, number> = {}
  allClients.forEach(c => {
    const d = new Date(c.created_at)
    if (d >= start && d <= end) {
      const day = d.toISOString().split('T')[0]!
      dailyNew[day] = (dailyNew[day] || 0) + 1
    }
  })

  // Top Clients
  const topClients = allClients
    .map(c => ({
      id: c.id,
      name: c.full_name,
      avatarUrl: null,
      visits: visitCounts[c.id] || 0,
      totalSpent: (spentCounts[c.id] || 0) / 100,
      lastVisit: 'N/A', // Simplified for now
      loyaltyPoints: 0
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10)

  return {
    kpis: {
      totalActive, totalActiveChange: 0,
      newClients, newClientsChange: 0,
      recurringClients, recurringClientsChange: 0,
      retentionRate: totalActive > 0 ? (recurringClients / totalActive) * 100 : 0,
      retentionRateChange: 0
    },
    newClientsChart: Object.entries(dailyNew).map(([date, count]) => ({ date, count })),
    frequencyDistribution: [
      { range: '1 visita', count: Object.values(visitCounts).filter(v => v === 1).length },
      { range: '2-3 visitas', count: Object.values(visitCounts).filter(v => v >= 2 && v <= 3).length },
      { range: '4+ visitas', count: Object.values(visitCounts).filter(v => v >= 4).length },
    ],
    birthdays: [],
    topClients
  }
})

// ─── Relatório de Equipe ──────────────────────────────────────

export const getTeamReport = cache(async (startDate: string, endDate: string): Promise<TeamReport> => {
  const user = await requireUser()
  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const { data: barbers } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name')
    .eq('organization_id', user.organization_id)
    .eq('role', 'barber')

  const { data: apps } = await supabaseAdmin
    .from('appointments')
    .select('status, price_cents, barber_id, start_time, service:services(name)')
    .eq('organization_id', user.organization_id)
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString())

  const barberList = barbers ?? []
  const allApps = apps ?? []

  const stats: Record<string, any> = {}
  barberList.forEach(b => {
    stats[b.id] = {
      id: b.id, name: b.full_name, avatarUrl: null,
      appointments: 0, revenue: 0, rating: 5.0, completionRate: 0, cancellations: 0,
      services: {} as Record<string, number>
    }
  })

  allApps.forEach(a => {
    if (a.barber_id && stats[a.barber_id]) {
      const b = stats[a.barber_id]
      b.appointments++
      if (a.status === 'completed') {
        b.revenue += (a.price_cents || 0) / 100
        const sName = (a.service as any)?.name || 'Outros'
        b.services[sName] = (b.services[sName] || 0) + 1
      } else if (a.status === 'cancelled') {
        b.cancellations++
      }
    }
  })

  const finalBarbers = Object.values(stats).map((b: any) => ({
    ...b,
    completionRate: b.appointments > 0 ? Math.round(((b.appointments - b.cancellations) / b.appointments) * 100) : 0
  }))

  return {
    barbers: finalBarbers,
    revenueComparison: finalBarbers.map(b => ({ name: b.name, revenue: b.revenue, color: '#3b82f6' })),
    weeklyEvolution: [],
    serviceDistribution: finalBarbers.map(b => ({
      barberName: b.name,
      ...b.services
    }))
  }
})

// ─── Relatório de Fidelidade ───────────────────────────────────

export const getLoyaltyReport = cache(async (startDate: string, endDate: string): Promise<LoyaltyReport> => {
  const user = await requireUser()
  
  const { data: stamps } = await supabaseAdmin
    .from('loyalty_stamps')
    .select('id, client_id, status, created_at')
    .eq('organization_id', user.organization_id)

  const allStamps = stamps ?? []
  const activeMembers = new Set(allStamps.map(s => s.client_id)).size
  const redemptions = allStamps.filter(s => s.status === 'redeemed').length
  const stampsDistributed = allStamps.length

  return {
    kpis: {
      activeMembers, activeMembersChange: 0,
      redemptions, redemptionsChange: 0,
      stampsDistributed, stampsDistributedChange: 0,
      readyToRedeem: 0, readyToRedeemChange: 0
    },
    redemptionsByMonth: [],
    stampsDistribution: []
  }
})

export async function getFullReport(startDate: string, endDate: string) {
  const [revenue, appointments, clients, team, loyalty] = await Promise.all([
    getRevenueReport(startDate, endDate),
    getAppointmentsReport(startDate, endDate),
    getClientsReport(startDate, endDate),
    getTeamReport(startDate, endDate),
    getLoyaltyReport(startDate, endDate),
  ])
  return { revenue, appointments, clients, team, loyalty }
}

