import { z } from 'zod'

const emptyToNull = z.string().transform(v => v.trim() === '' ? null : v.trim())

export const updateBarberSchema = z.object({
  full_name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  phone: emptyToNull
    .pipe(
      z.string()
        .regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, 'Formato: (11) 98765-4321')
        .nullable()
    )
    .optional()
    .nullable(),
  specialty: z.string().min(1, 'Selecione uma especialidade'),
  avatar_url: emptyToNull.optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
})

export type UpdateBarberInput = z.infer<typeof updateBarberSchema>
