import { z } from 'zod'

export const sendMessageSchema = z.object({
  client_id: z.string().uuid('Cliente inválido'),
  content: z.string().min(1, 'Mensagem obrigatória').max(1000),
  template_used: z.string().optional().nullable(),
})

export const templateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome muito curto').max(60, 'Nome muito longo'),
  description: z.string().max(100, 'Descrição muito longa').optional().nullable(),
  trigger_type: z.enum([
    'manual',
    'reminder',
    'confirmation',
    'birthday',
    'loyalty',
    'reactivation'
  ]),
  content: z.string().min(10, 'Mensagem deve ter no mínimo 10 caracteres').max(500, 'Máximo de 500 caracteres'),
})

export type TemplateInput = z.infer<typeof templateSchema>

export const broadcastSchema = z.object({
  group: z.enum(['birthday_month', 'inactive_30', 'loyalty_complete', 'all_active']),
  template_key: z.string().min(1, 'Template é obrigatório'),
  content: z.string().min(1),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type BroadcastInput = z.infer<typeof broadcastSchema>
