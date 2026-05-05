import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
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

  console.log('\n--- NOTA IMPORTANTE ---')
  console.log('Bucket criado, mas você ainda pode precisar configurar as Policies (RLS) no Dashboard do Supabase para permitir o upload.')
}

setupStorage()
