import { z } from 'zod'

export const createServiceSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  description: z.string().trim().max(500, 'Descrição muito longa').optional().or(z.literal('')),
  duration: z.number().min(15, 'Mínimo 15 minutos').max(480, 'Máximo 8 horas'),
  price: z.number().positive('Preço deve ser maior que zero'),
  category: z.enum(['corte', 'barba', 'combo', 'outros']),
  isActive: z.boolean().default(true),
}).strict()

export const updateServiceSchema = createServiceSchema.partial().extend({
  id: z.string().uuid(),
}).strict()

export const toggleServiceStatusSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
}).strict()

export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
export type ToggleServiceStatusInput = z.infer<typeof toggleServiceStatusSchema>
