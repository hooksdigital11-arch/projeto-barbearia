import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

export const getUser = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // --- MOCK PARA DESENVOLVIMENTO ---
  // Se quiser testar roles diferentes, mude o 'role' abaixo:
  // Opções: 'admin', 'barber', 'client'
  if (process.env.NODE_ENV === 'development') {
    return {
      id: 'mock-id',
      full_name: 'Vitor Campos (Dev)',
      email: 'dev@barbersaas.com',
      role: 'admin', // Mude aqui para testar as outras dashboards!
      organization_id: 'mock-org',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      phone: '11999999999'
    } as Profile
  }
  // ---------------------------------

  if (!user) return null

  // Buscar profile completo
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
})

export async function requireUser(): Promise<Profile> {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  if (user.role !== 'admin') redirect('/')
  return user
}
