import { z } from 'zod'

// Regex customizadas seguras
const PHONE_REGEX = /^\(\d{2}\)\s\d{5}-\d{4}$/
const SAFE_NAME_REGEX = /^[a-zA-Z0-9\s\-'àáâãäåèéêëìíîïòóôõöùúûüçñ]+$/

export const uuidSchema = z.string().uuid('ID inválido (UUID esperado)')

export const emailSchema = z.string().email('Email inválido').max(255)

export const phoneSchema = z.string().regex(PHONE_REGEX, 'Formato de telefone inválido')

export const safeNameSchema = z
  .string()
  .min(2, 'Mínimo de 2 caracteres')
  .max(100, 'Máximo de 100 caracteres')
  .regex(SAFE_NAME_REGEX, 'Caracteres inválidos detectados')
  .transform(v => v.trim())

export const passwordSchema = z
  .string()
  .min(8, 'Mínimo de 8 caracteres')
  .max(128, 'Máximo de 128 caracteres')
  .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
  .regex(/[0-9]/, 'Deve conter pelo menos um número')
  .regex(/[!@#$%^&*]/, 'Deve conter pelo menos um caractere especial')

export const textSchema = z
  .string()
  .max(1000, 'Máximo de 1000 caracteres')
  .transform(v => v.trim())

export const notesSchema = z
  .string()
  .max(5000, 'Máximo de 5000 caracteres')
  .optional()
  .transform(v => v?.trim())

export const positiveInt = z.number().int().positive()

export const cents = z.number().int().min(0, 'Não pode ser negativo').max(999_999_999)
