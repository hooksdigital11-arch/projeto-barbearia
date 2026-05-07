import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.rpc('get_revenue_report_data', {
    p_org_id: '00000000-0000-0000-0000-000000000000', // random uuid just to test syntax/execution
    p_start_date: '2026-05-01',
    p_end_date: '2026-05-07'
  })
  
  if (error) {
    console.error('RPC ERROR:', error)
  } else {
    console.log('RPC SUCCESS:', data)
  }
}

test()
