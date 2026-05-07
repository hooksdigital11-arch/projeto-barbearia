import 'server-only'
import { cache } from 'react'
import { requireUser } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'

// Helper to get first day of current and last month
function getMonthDates() {
  const now = new Date()
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()
  return { startOfCurrentMonth, startOfLastMonth, endOfLastMonth }
}

export const getAdminKPIs = cache(async () => {
  const user = await requireUser()
  const supabase = await createClient()
  
  const { startOfCurrentMonth, startOfLastMonth, endOfLastMonth } = getMonthDates()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startOfToday = today.toISOString()
  
  // 1. Revenue (Current Month vs Last Month)
  const [{ data: currentApps }, { data: lastApps }] = await Promise.all([
    supabase.from('appointments')
      .select('price_cents')
      .eq('organization_id', user.organization_id)
      .eq('status', 'completed')
      .gte('start_time', startOfCurrentMonth),
    supabase.from('appointments')
      .select('price_cents')
      .eq('organization_id', user.organization_id)
      .eq('status', 'completed')
      .gte('start_time', startOfLastMonth)
      .lte('start_time', endOfLastMonth)
  ])

  const currentRevenue = ((currentApps as any[]) || []).reduce((acc, item) => acc + (item.price_cents || 0), 0) / 100
  const lastRevenue = ((lastApps as any[]) || []).reduce((acc, item) => acc + (item.price_cents || 0), 0) / 100
  
  let revenueTrend = 0
  if (lastRevenue > 0) {
    revenueTrend = ((currentRevenue - lastRevenue) / lastRevenue) * 100
  } else if (currentRevenue > 0) {
    revenueTrend = 100
  }

  // 2. Appointments (Today)
  const { data: appointments } = await supabase.from('appointments')
    .select('status')
    .eq('organization_id', user.organization_id)
    .gte('start_time', startOfToday)
    
  const apps = (appointments as any[]) || []
  const totalApps = apps.length
  const completedApps = apps.filter(a => a.status === 'completed').length
  const pendingApps = apps.filter(a => ['scheduled', 'in_progress'].includes(a.status)).length

  // 3. New Clients (Current Month vs Last Month)
  const [{ count: currentClients }, { count: lastClients }] = await Promise.all([
    supabase.from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', user.organization_id)
      .gte('created_at', startOfCurrentMonth),
    supabase.from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', user.organization_id)
      .gte('created_at', startOfLastMonth)
      .lte('created_at', endOfLastMonth)
  ])

  const curClients = currentClients || 0
  const prevClients = lastClients || 0
  let clientsTrend = 0
  if (prevClients > 0) {
    clientsTrend = ((curClients - prevClients) / prevClients) * 100
  } else if (curClients > 0) {
    clientsTrend = 100
  }

  return {
    revenue: {
      value: currentRevenue,
      trend: Math.abs(Math.round(revenueTrend)),
      isPositive: revenueTrend >= 0
    },
    appointments: {
      total: totalApps,
      completed: completedApps,
      pending: pendingApps
    },
    newClients: {
      value: curClients,
      trend: Math.abs(Math.round(clientsTrend)),
      isPositive: clientsTrend >= 0
    },
    loyaltyRedeemable: {
      value: 0 // Simplificado para esta fase
    }
  }
})

export const getBarbersPerformance = cache(async () => {
  const user = await requireUser()
  const supabase = await createClient()
  
  const { startOfCurrentMonth } = getMonthDates()

  // Buscar barbeiros
  const { data: barbersData } = await supabase.from('profiles')
    .select('id, full_name, avatar_url')
    .eq('organization_id', user.organization_id)
    .eq('role', 'barber')

  const barbers = (barbersData as any[]) || []
  if (barbers.length === 0) return []

  // Buscar agendamentos do mês para os barbeiros
  const { data: appointments } = await supabase.from('appointments')
    .select('barber_id, price_cents, id')
    .eq('organization_id', user.organization_id)
    .eq('status', 'completed')
    .gte('start_time', startOfCurrentMonth)

  const items = (appointments as any[]) || []

  // Cores fixas para os barbeiros baseadas na doc (Rafael, Thiago, Marcos)
  const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899']

  const performance = barbers.map((barber, index) => {
    const barberItems = items.filter(i => i.barber_id === barber.id)
    const revenue = barberItems.reduce((acc, item) => acc + (item.price_cents || 0), 0) / 100
    
    // Contar agendamentos únicos
    const uniqueAppointments = barberItems.length

    return {
      id: barber.id,
      name: barber.full_name?.split(' ')[0] || 'Barbeiro', // Pegar o primeiro nome
      avatar: barber.avatar_url,
      appointments: uniqueAppointments,
      revenue: revenue,
      rating: 5.0, // Placeholder
      color: colors[index % colors.length]
    }
  })

  // Ordenar por receita decrescente
  return performance.sort((a, b) => b.revenue - a.revenue)
})
