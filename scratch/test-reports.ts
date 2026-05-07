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
      
  console.log("Found:", currentApps?.length)
  console.log("Error:", error)
  console.log("Data:", currentApps)
}

test()
