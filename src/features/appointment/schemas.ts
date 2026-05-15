import { z } from 'zod'

export const createAppointmentSchema = z.object({
  client_id: z.string().uuid('Cliente inválido'),
  service_id: z.string().uuid('Serviço inválido'),
  barber_id: z.string().uuid('Barbeiro inválido'),
  start_time: z.string().min(1, 'Data/hora obrigatória'),
  notes: z.string().max(500).optional().nullable(),
  price_cents: z.number().int().min(0).optional(),
})

export const updateAppointmentSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid().optional(),
  service_id: z.string().uuid().optional(),
  barber_id: z.string().uuid().optional(),
  start_time: z.string().optional(),
  notes: z.string().max(500).optional().nullable(),
  price_cents: z.number().int().min(0).optional(),
})

export const updateAppointmentStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'no_show', 'cancelled']),
})

export const createClientAppointmentSchema = z.object({
  service_id: z.string().uuid('Serviço inválido'),
  barber_id: z.string().uuid('Barbeiro inválido'),
  start_time: z.string().min(1, 'Data/hora obrigatória'),
  notes: z.string().max(500).optional().nullable(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>
export type UpdateStatusInput = z.infer<typeof updateAppointmentStatusSchema>
export type CreateClientAppointmentInput = z.infer<typeof createClientAppointmentSchema>
