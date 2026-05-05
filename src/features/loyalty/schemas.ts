import { z } from 'zod'

export const loyaltyConfigSchema = z.object({
  mode: z.enum(['stamps', 'points']),
  stamps_required: z.coerce.number().min(1).max(50),
  points_per_real: z.coerce.number().min(1).max(10),
  points_required: z.coerce.number().min(1).max(10000),
  reward_service_id: z.string().optional().nullable(),
  reward_description: z.string().min(3, 'Mínimo 3 caracteres').max(100),
})

export const addStampSchema = z.object({
  amount: z.coerce.number().min(1).max(10),
  notes: z.string().optional().nullable(),
})

export type LoyaltyConfigInput = z.infer<typeof loyaltyConfigSchema>
export type AddStampInput = z.infer<typeof addStampSchema>
