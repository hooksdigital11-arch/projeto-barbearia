'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { loginSchema, signupSchema, recoverySchema, resetPasswordSchema } from './schemas'
import type { AuthResponse } from './types'

// Lazy-initialize rate limiter only when Upstash env vars are present
async function checkLoginRateLimit(ip: string): Promise<{ limited: boolean }> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return { limited: false }

  try {
    const { Redis } = await import('@upstash/redis')
    const { Ratelimit } = await import('@upstash/ratelimit')
    const ratelimit = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      prefix: 'rl:login',
    })
    const { success } = await ratelimit.limit(ip)
    return { limited: !success }
  } catch {
    return { limited: false }
  }
}

/**
 * Server Action: Login
 */
export async function login(formData: FormData): Promise<AuthResponse | void> {
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    '127.0.0.1'

  const { limited } = await checkLoginRateLimit(ip)
  if (limited) {
    return { error: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' }
  }

  const data = Object.fromEntries(formData)
  const parsed = loginSchema.safeParse({
    ...data,
    rememberMe: data.rememberMe === 'on',
  })

  if (!parsed.success) {
    return {
      error: 'Dados de login inválidos',
      issues: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: 'Credenciais inválidas' }
  }

  // Buscar role para redirecionamento correto usando ADMIN para ignorar RLS problemático
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profileError) {
    console.error('[LOGIN] Erro ao buscar profile:', profileError.message, '| User ID:', authData.user.id)
  }

  const role = (profile as { role: string } | null)?.role || 'client'
  const redirectTo = role === 'admin' ? '/admin' : role === 'barber' ? '/barber' : '/client'

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

/**
 * Server Action: Signup
 */
export async function signup(formData: FormData): Promise<AuthResponse | void> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    acceptTerms: formData.get('acceptTerms') === 'on',
  })

  if (!parsed.success) {
    return {
      error: 'Dados inválidos',
      issues: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Erro ao criar conta' }
  }

  // ✅ Aqui o trigger já criou o profile automaticamente
  // Agora fazer login direto
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })
 
  if (signInError || !authData.user) {
    return {
      error: 'Erro ao fazer login automático. Tente novamente.',
    }
  }

  // Buscar role para redirecionamento correto usando ADMIN para ignorar RLS problemático
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profileError) {
    console.error('[SIGNUP] Erro ao buscar profile:', profileError.message, '| User ID:', authData.user.id)
  }

  const role = (profile as { role: string } | null)?.role || 'client'
  const redirectTo = role === 'admin' ? '/admin' : role === 'barber' ? '/barber' : '/client'
 
  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

/**
 * Server Action: Request Password Reset
 */
export async function requestPasswordReset(formData: FormData): Promise<AuthResponse> {
  const data = Object.fromEntries(formData)
  const parsed = recoverySchema.safeParse(data)

  if (!parsed.success) {
    return { error: 'Email inválido' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: 'Erro ao enviar email de recuperação' }
  }

  return {
    success: true,
    message: 'Link de recuperação enviado! Verifique seu email.',
  }
}

/**
 * Server Action: Confirm Password Reset
 * Called from /reset-password page after user lands there via email link
 */
export async function confirmPasswordReset(formData: FormData): Promise<AuthResponse> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    return {
      error: 'Dados inválidos',
      issues: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

  if (error) {
    return { error: 'Erro ao redefinir senha. O link pode ter expirado.' }
  }

  return { success: true, message: 'Senha redefinida com sucesso!' }
}

/**
 * Server Action: Logout
 */
export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
