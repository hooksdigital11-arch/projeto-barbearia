import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://tfsntzwwzhxybqgbxmag.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmc250end3emh4eWJxZ2J4bWFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgwNTI5OSwiZXhwIjoyMDkzMzgxMjk5fQ.m0rT8Pavv3HO2aXFSNrvn9I54SQBuUM5JVR5syp-tgA"
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const orgId = "11111111-1111-1111-1111-111111111111"
  const start = new Date("2026-05-07T03:00:00.000Z")
  const end = new Date("2026-05-08T02:59:59.999Z")

  const { data: currentApps, error } = await supabase
      .from('appointments')
      .select('id, price_cents, start_time, barber_id, service_id, status')
      .eq('organization_id', orgId)
      .eq('status', 'completed')
      .gte('start_time', start.toISOString())
      .lte('start_time', end.toISOString())
      
  const { data: currentComandas } = await supabase
    .from('comanda_items')
    .select('id, total_cents, payment_method, name, quantity, item_type, paid_at, created_at, appointment_id')
    .eq('organization_id', orgId)
    .eq('paid', true)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())

  const items = (currentApps as any[]) || []
  const comandas = (currentComandas as any[]) || []
  const comandasAvulsas = comandas.filter(c => !c.appointment_id)

  const totalRevenueCents = items.reduce((acc, a) => acc + (a.price_cents || 0), 0) + 
                            comandasAvulsas.reduce((acc, c) => acc + (c.total_cents || 0), 0)

  const totalItemsCount = items.length + comandasAvulsas.length
  const avgTicket = totalItemsCount > 0 ? (totalRevenueCents / totalItemsCount) / 100 : 0

  console.log("Total Appointments (items):", items.length)
  console.log("Total Comandas Avulsas:", comandasAvulsas.length)
  console.log("Total Revenue (BRL):", totalRevenueCents / 100)
  console.log("Average Ticket (BRL):", avgTicket)
  console.log("Total Comandas (KPI):", totalItemsCount)
}

test()
