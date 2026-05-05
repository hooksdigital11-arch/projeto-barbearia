import { z } from 'zod'

// Helper para converter string vazia em null
const emptyToNull = z.string().transform(v => v.trim() === '' ? null : v.trim())

export const createProductSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  type: z.enum(['revenda', 'uso_interno'], { message: 'Tipo inválido' }),
  category: z.string().min(1, 'Selecione uma categoria'),
  description: emptyToNull.optional().nullable(),
  quantity: z.number().min(0, 'Quantidade não pode ser negativa'),
  min_quantity: z.number().min(0, 'Mínimo não pode ser negativo'),
  cost_cents: z.number().positive('Custo deve ser maior que zero').optional().nullable(),
  price_cents: z.number().positive('Preço deve ser maior que zero').optional().nullable(),
  supplier: emptyToNull.optional().nullable(),
  supplier_phone: emptyToNull
    .pipe(
      z.string()
        .regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, 'Formato: (11) 98765-4321')
        .nullable()
    )
    .optional()
    .nullable(),
})

export const updateProductSchema = createProductSchema.extend({
  active: z.boolean().default(true),
})

export const moveStockSchema = z.object({
  direction: z.enum(['in', 'out']),
  quantity: z.number().positive('Quantidade deve ser maior que 0'),
  reason: z.string().min(1, 'Selecione um motivo'),
  observation: emptyToNull.optional().nullable(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type MoveStockInput = z.infer<typeof moveStockSchema>
