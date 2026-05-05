import { z } from 'zod'

export const createClientSchema = z.object({
  full_name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  phone: z
    .string()
    .min(1, 'Telefone obrigatório')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato: (11) 98765-4321'),
  email: z.string().email('Email inválido').optional().nullable(),
  birthday: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || new Date(val) <= new Date(),
      'Aniversário não pode ser no futuro'
    ),
  preferred_barber_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(2000, 'Máximo 2000 caracteres').optional().nullable(),
}).strict()

export const updateClientSchema = createClientSchema.extend({
  status: z.enum(['active', 'inactive', 'blocked']).optional(),
}).strict()

export const updateNotesSchema = z.object({
  notes: z.string().max(2000, 'Máximo 2000 caracteres'),
}).strict()

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
