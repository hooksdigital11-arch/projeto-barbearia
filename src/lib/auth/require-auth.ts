import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Profile } from '@/types/database'

/**
 * Busca o profile completo do usuário logado.
 * Retorna null se não houver sessão ativa.
 * Se a sessão existe mas o profile não, cria um profile básico.
 */
export const getUser = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Buscar profile completo usando o cliente ADMIN para evitar erros de RLS (recursão infinita)
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Se o profile não existe mas o auth user sim,
  // retornar um profile básico derivado do auth user.
  // Isso evita que o usuário fique preso num redirect loop.
  if (!profile) {
    return {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
      email: user.email || '',
      role: 'client',
      organization_id: '',
      avatar_url: null,
      created_at: user.created_at,
      updated_at: new Date().toISOString(),
      phone: user.user_metadata?.phone || '',
    } as Profile
  }

  return profile
})

/**
 * Exige que o usuário esteja logado. Redireciona para /login se não estiver.
 * NOTA: O middleware já protege as rotas, então esta função serve como
 * fallback de segurança e para tipar o retorno como non-null.
 */
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

export async function requireBarber() {
  const user = await requireUser()
  if (user.role !== 'barber' && user.role !== 'admin') redirect('/')
  return user
}

export async function requireClient() {
  const user = await requireUser()
  if (user.role !== 'client') redirect('/')
  return user
}
