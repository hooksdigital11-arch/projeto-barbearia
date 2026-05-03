'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema, recoverySchema } from './schemas'
import type { AuthResponse } from './types'

/**
 * Server Action: Login
 */
export async function login(formData: FormData): Promise<AuthResponse> {
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

  // Buscar role para redirecionamento correto
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  const role = profile?.role || 'client'
  const redirectTo = role === 'admin' ? '/admin' : role === 'barber' ? '/barber' : '/client'

  revalidatePath('/', 'layout')
  return { success: true, redirectTo }
}

/**
 * Server Action: Signup
 */
export async function signup(formData: FormData): Promise<AuthResponse> {
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

  // Buscar role (deve ser 'client' por padrão para novos cadastros via formulário público)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  const role = profile?.role || 'client'
  const redirectTo = role === 'admin' ? '/admin' : role === 'barber' ? '/barber' : '/client'
 
  revalidatePath('/', 'layout')
  return { success: true, redirectTo }
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
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
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
 * Server Action: Logout
 */
export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
