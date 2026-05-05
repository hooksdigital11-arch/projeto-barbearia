const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

try {
  const envPath = path.resolve(process.cwd(), '.env')
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/)[1]
  const supabaseServiceKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/)[1]

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables in .env')
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  async function setupStorage() {
    console.log('Verificando buckets...')
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Erro ao listar buckets:', listError.message)
      return
    }

    const bucketExists = buckets.some(b => b.name === 'logos')

    if (!bucketExists) {
      console.log('Criando bucket "logos"...')
      const { error: createError } = await supabase.storage.createBucket('logos', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
        fileSizeLimit: 5242880 // 5MB
      })

      if (createError) {
        console.error('Erro ao criar bucket:', createError.message)
      } else {
        console.log('Bucket "logos" criado com sucesso!')
      }
    } else {
      console.log('Bucket "logos" já existe.')
    }
  }

  setupStorage()

} catch (err) {
  console.error('Erro ao ler .env ou configurar Supabase:', err.message)
  process.exit(1)
}
