import 'server-only'
import { cache } from 'react'
import { requireUser } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'

/**
 * Barber Data Access Layer (Real)
 */
export const getBarberDashboardData = cache(async () => {
  const user = await requireUser()
  const supabase = await createClient()
  
  const { data, error } = await (supabase as any)
    .rpc('get_barber_dashboard_data', {
      p_barber_id: user.id
    })

  if (error || !data) {
    console.error('[GET_BARBER_DASHBOARD_DATA] Error:', error)
    return {
      status: 'Indisponível',
      shift: '---',
      stats: { revenueDay: 0, appointmentsCompleted: 0, appointmentsCurrent: 0 },
      currentClient: null,
      appointments: [],
      waitingList: []
    }
  }

  return data
})
