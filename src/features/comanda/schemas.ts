import { z } from 'zod'

export const addItemSchema = z.object({
  client_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional().nullable(),
  item_type: z.enum(['service', 'product']),
  name: z.string().min(1),
  quantity: z.number().min(1).max(99),
  unit_price_cents: z.number().min(0),
  inventory_id: z.string().uuid().optional().nullable(),
})

export const closeComandaSchema = z.object({
  client_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional().nullable(),
  payment_method: z.enum(['cash', 'pix', 'credit_card', 'debit_card']),
  discount_cents: z.number().min(0).default(0),
})

export type AddItemInput = z.infer<typeof addItemSchema>
export type CloseComandaInput = z.infer<typeof closeComandaSchema>
