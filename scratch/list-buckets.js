const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

try {
  const envPath = path.resolve(process.cwd(), '.env')
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/)[1]
  const supabaseServiceKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/)[1]

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  async function listBuckets() {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) {
      console.error('Erro:', error.message)
    } else {
      console.log('Buckets encontrados:', buckets.map(b => b.name).join(', '))
    }
  }

  listBuckets()

} catch (err) {
  console.error('Erro:', err.message)
}
