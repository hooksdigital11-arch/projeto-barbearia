import { describe, it, expect } from 'vitest'
import { loginSchema, signupSchema } from '@/features/auth/schemas'

describe('Auth Schemas Validation', () => {
  it('should validate a correct login payload', () => {
    const result = loginSchema.safeParse({
      email: 'barbeiro@exemplo.com',
      password: 'Password123!',
    })
    expect(result.success).toBe(true)
  })

  it('should reject an invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'email-invalido',
      password: 'Password123!',
    })
    expect(result.success).toBe(false)
  })

  it('should validate a complete signup payload', () => {
    const result = signupSchema.safeParse({
      fullName: 'Vitor Campos',
      email: 'vitor@barbearia.com',
      phone: '(11) 98765-4321',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
      acceptTerms: true,
    })
    expect(result.success).toBe(true)
  })

  it('should reject mismatched passwords', () => {
    const result = signupSchema.safeParse({
      fullName: 'Vitor Campos',
      email: 'vitor@barbearia.com',
      phone: '(11) 98765-4321',
      password: 'StrongPass123!',
      confirmPassword: 'DifferentPass123!',
      acceptTerms: true,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toContain('Senhas não conferem')
    }
  })

  it('should enforce password complexity requirements', () => {
    // Missing capital letter
    const result = signupSchema.safeParse({
      fullName: 'Vitor Campos',
      email: 'vitor@barbearia.com',
      phone: '(11) 98765-4321',
      password: 'weakpassword123!',
      confirmPassword: 'weakpassword123!',
      acceptTerms: true,
    })
    expect(result.success).toBe(false)
  })
})
