import { z } from 'zod'

export const createUserSchema = z.object({
  fullName: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().trim().email('Email inválido'),
  phone: z.string().trim().optional(),
  role: z.enum(['admin', 'barber', 'client']),
  specialty: z.string().trim().max(100).optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
  autoConfirm: z.boolean().default(true),
}).strict()

export const updateUserSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().optional(),
  specialty: z.string().trim().max(100).optional(),
  status: z.enum(['active', 'inactive']).optional(),
}).strict()

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
