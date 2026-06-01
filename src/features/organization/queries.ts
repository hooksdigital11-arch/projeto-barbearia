import 'server-only'
import { cache } from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Busca informações básicas da organização (nome, logo) para exibição no layout.
 * Não exige role de admin, apenas que o usuário pertença à organização.
 */
export const getOrganization = cache(async (organizationId: string) => {
  if (!organizationId) return null

  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select('id, name, logo_url, phone, address, loyalty_config')
    .eq('id', organizationId)
    .single()
  
  if (error) {
    console.error('[GET_ORGANIZATION] Error:', error.message)
    return null
  }

  return data
})
