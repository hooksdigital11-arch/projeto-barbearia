export type ReportPeriod = 'today' | 'week' | 'month' | 'year' | 'custom'

export interface RevenueData {
  date: string
  revenue: number
  previousRevenue?: number
}

export interface PaymentMethodData {
  method: string
  value: number
  percentage: number
}

export interface ServiceSalesData {
  name: string
  quantity: number
  totalRevenue: number
}

export interface ProductSalesData {
  name: string
  category: string
  quantity: number
  totalRevenue: number
}

export interface BarberRevenueData {
  barberId: string
  name: string
  avatarUrl: string | null
  appointments: number
  revenue: number
  percentage: number
  averageTicket: number
}

export interface RevenueReport {
  kpis: {
    totalRevenue: number
    totalRevenueChange: number
    serviceRevenue: number
    serviceRevenueChange: number
    productRevenue: number
    productRevenueChange: number
    averageTicket: number
    averageTicketChange: number
    totalComandas: number
    totalComandasChange: number
    totalDiscounts: number
    totalDiscountsChange: number
  }
  chartData: RevenueData[]
  paymentMethods: PaymentMethodData[]
  topServices: ServiceSalesData[]
  topProducts: ProductSalesData[]
  barberPerformance: BarberRevenueData[]
  consumedStock: {
    inventoryId: string
    name: string
    category: string
    type: 'venda' | 'uso_interno'
    qtdSaida: number
  }[]
}

export interface AppointmentStatusData {
  status: string
  count: number
  color: string
}

export interface DayOfWeekData {
  day: string
  count: number
}

export interface PeakHourData {
  hour: string
  count: number
}

export interface BarberAppointmentData {
  barberName: string
  count: number
}

export interface AppointmentReport {
  kpis: {
    total: number
    totalChange: number
    completed: number
    completedChange: number
    cancelled: number
    cancelledChange: number
    noShow: number
    noShowChange: number
    completionRate: number
    completionRateChange: number
  }
  statusDistribution: AppointmentStatusData[]
  dayOfWeekDistribution: DayOfWeekData[]
  peakHours: PeakHourData[]
  barberDistribution: BarberAppointmentData[]
}

export interface ClientReport {
  kpis: {
    totalActive: number
    totalActiveChange: number
    newClients: number
    newClientsChange: number
    recurringClients: number
    recurringClientsChange: number
    retentionRate: number
    retentionRateChange: number
  }
  newClientsChart: { date: string; count: number }[]
  frequencyDistribution: { range: string; count: number }[]
  birthdays: {
    id: string
    name: string
    date: string
    phone: string | null
  }[]
  topClients: {
    id: string
    name: string
    avatarUrl: string | null
    visits: number
    totalSpent: number
    lastVisit: string
    loyaltyPoints: number
  }[]
}

export interface TeamReport {
  barbers: {
    id: string
    name: string
    avatarUrl: string | null
    appointments: number
    revenue: number
    rating: number
    completionRate: number
    cancellations: number
  }[]
  revenueComparison: { name: string; revenue: number; color: string }[]
  weeklyEvolution: { date: string; [barberName: string]: string | number }[]
  serviceDistribution: { barberName: string; [serviceName: string]: string | number }[]
}

export interface LoyaltyReport {
  kpis: {
    activeMembers: number
    activeMembersChange: number
    redemptions: number
    redemptionsChange: number
    stampsDistributed: number
    stampsDistributedChange: number
    readyToRedeem: number
    readyToRedeemChange: number
  }
  redemptionsByMonth: { month: string; count: number }[]
  stampsDistribution: { range: string; count: number }[]
}
