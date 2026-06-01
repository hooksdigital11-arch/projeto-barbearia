import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data: users, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (error) {
    console.error(error)
    process.exit(1)
  }
  console.log(users.users.map(u => ({ id: u.id, email: u.email })))
}
main()
