import { createClient } from '@supabase/supabase-js'
import { env } from '@/env/server'
import type { Database } from '@/types/supabase'

/**
 * Cliente Supabase com privilégios de service_role.
 * Ignora RLS. Use APENAS no servidor e para operações que o usuário 
 * não pode fazer via RLS (como verificar roles no login/middleware).
 */
export const supabaseAdmin = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
