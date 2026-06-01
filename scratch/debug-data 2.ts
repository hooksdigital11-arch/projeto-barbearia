import { createClient } from './src/lib/supabase/server'
import { requireAdmin } from './src/lib/auth/require-auth'

async function debug() {
  try {
    const user = await requireAdmin()
    const supabase = await createClient()

    console.log('Org ID:', user.organization_id)

    const { count: appointmentsCount, data: apps } = await supabase
      .from('appointments')
      .select('id, status, start_time', { count: 'exact' })
      .eq('organization_id', user.organization_id)

    console.log('Total Appointments:', appointmentsCount)
    console.log('Statuses:', apps?.map(a => a.status))
    console.log('Times:', apps?.map(a => a.start_time))

    const { count: comandasCount, data: comandas } = await supabase
      .from('comanda_items')
      .select('id, paid, created_at', { count: 'exact' })
      .eq('organization_id', user.organization_id)

    console.log('Total Comanda Items:', comandasCount)
    console.log('Paid statuses:', comandas?.map(c => c.paid))

  } catch (e) {
    console.error('Debug failed:', e)
  }
}

debug()
