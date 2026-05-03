'use server'

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

  // TODO: Integrar Supabase Auth
  console.log('[Auth Action] Login Attempt:', { email: parsed.data.email })
  
  return { success: true }
}

/**
 * Server Action: Signup
 */
export async function signup(formData: FormData): Promise<AuthResponse> {
  const data = Object.fromEntries(formData)
  const parsed = signupSchema.safeParse({
    ...data,
    acceptTerms: data.acceptTerms === 'on',
  })

  if (!parsed.success) {
    return {
      error: 'Erro na validação do cadastro',
      issues: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  // TODO: Integrar Supabase Auth
  console.log('[Auth Action] Signup Attempt:', { 
    fullName: parsed.data.fullName, 
    email: parsed.data.email 
  })
  
  return { success: true }
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

  // TODO: Enviar email via Resend/Supabase
  console.log('[Auth Action] Recovery Attempt:', { email: parsed.data.email })
  
  return { success: true }
}
