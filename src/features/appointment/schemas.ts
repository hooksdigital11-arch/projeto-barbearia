import { z } from 'zod'

export const createAppointmentSchema = z.object({
  client_id: z.string().uuid('Cliente inválido'),
  service_id: z.string().uuid('Serviço inválido'),
  barber_id: z.string().uuid('Barbeiro inválido'),
  start_time: z.string().datetime('Data inválida'),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>

export const updateAppointmentStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'no_show', 'cancelled']),
})
