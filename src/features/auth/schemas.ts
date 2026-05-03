import { z } from 'zod'

/**
 * Login Validation Schema
 */
export const loginSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().optional().default(false),
})

/**
 * Signup Validation Schema
 * Enforces strong password requirements and Brazilian phone format.
 */
export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Nome deve ter 2+ caracteres')
      .max(100, 'Max 100 caracteres')
      .regex(/^[a-zA-Z\s'-]+$/, 'Apenas letras, espaços e hífens'),
    email: z.string().email('Email inválido').max(255),
    phone: z
      .string()
      .regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, 'Formato: (11) 98765-4321'),
    password: z
      .string()
      .min(8, 'Min 8 caracteres')
      .regex(/[A-Z]/, 'Precisa de pelo menos uma letra maiúscula')
      .regex(/[0-9]/, 'Precisa de pelo menos um número')
      .regex(/[!@#$%^&*]/, 'Precisa de pelo menos um caractere especial'),
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine((v) => v === true, 'Você deve aceitar os termos e a privacidade'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

/**
 * Password Recovery Validation Schema
 */
export const recoverySchema = z.object({
  email: z.string().email('Email inválido').max(255),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type RecoveryInput = z.infer<typeof recoverySchema>
