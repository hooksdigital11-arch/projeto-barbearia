import { z } from 'zod'

export const updateClientProfileSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  phone: z.string().max(20).optional().or(z.literal('')),
}).strict()

export type UpdateClientProfileInput = z.infer<typeof updateClientProfileSchema>
