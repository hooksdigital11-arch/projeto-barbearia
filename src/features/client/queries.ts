import 'server-only'
import { cache } from 'react'
import { requireUser } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'

/**
 * Client Data Access Layer (Real)
 */
export const getClientDashboardData = cache(async () => {
  const user = await requireUser()
  const supabase = await createClient()
  
  const { data, error } = await (supabase as any)
    .rpc('get_client_dashboard_data', {
      p_user_id: user.id
    })

  if (error || !data) {
    console.error('[GET_CLIENT_DASHBOARD_DATA] Error:', error)
    return {
      profile: {
        name: user.full_name || 'Cliente',
        avatar: user.avatar_url,
        preferredBarber: '---',
        loyaltyStamps: 0,
        nextAppointment: null
      },
      upcomingAppointments: [] as any[],
      history: [] as any[],
      availableCoupons: [] as any[]
    }
  }

  return data as {
    profile: {
      name: string
      avatar: string | null
      preferredBarber: string
      loyaltyStamps: number
      nextAppointment: string | null
    }
    upcomingAppointments: any[]
    history: any[]
    availableCoupons: any[]
  }
})
