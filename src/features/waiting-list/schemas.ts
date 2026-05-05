import { z } from 'zod'

export const joinQueueSchema = z.object({
  client_id: z.string().uuid('ID do cliente inválido'),
  service_id: z.string().uuid('ID do serviço inválido'),
  barber_id: z.string().uuid('ID do barbeiro inválido').optional().nullable(),
  phone: z
    .string()
    .min(1, 'Telefone obrigatório')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato: (11) 98765-4321'),
}).strict()

export type JoinQueueInput = z.infer<typeof joinQueueSchema>
