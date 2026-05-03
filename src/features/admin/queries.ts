import { cache } from 'react'
import { requireUser } from '@/lib/auth/require-auth'

/**
 * Admin Data Access Layer (Mock)
 * These queries will be integrated with Supabase in the next phase.
 */

export const getAdminKPIs = cache(async () => {
  const user = await requireUser()
  
  // Mock data simulation
  return {
    revenue: {
      value: 5240,
      trend: 12,
      isPositive: true
    },
    appointments: {
      total: 12,
      completed: 5,
      pending: 7
    },
    newClients: {
      value: 3,
      trend: 5,
      isPositive: true
    },
    loyaltyRedeemable: {
      value: 5
    }
  }
})

export const getBarbersPerformance = cache(async () => {
  return [
    {
      id: '1',
      name: 'Rafael',
      avatar: null,
      appointments: 5,
      revenue: 1200,
      rating: 4.8,
      color: '#3b82f6'
    },
    {
      id: '2',
      name: 'Thiago',
      avatar: null,
      appointments: 4,
      revenue: 900,
      rating: 4.9,
      color: '#f59e0b'
    },
    {
      id: '3',
      name: 'Marcos',
      avatar: null,
      appointments: 3,
      revenue: 600,
      rating: 4.6,
      color: '#10b981'
    }
  ]
})
