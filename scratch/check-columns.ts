import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function check() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('ERROR:', error)
  } else {
    console.log('COLUMNS:', data && data.length > 0 ? Object.keys(data[0]) : 'No rows')
  }
}

check()
