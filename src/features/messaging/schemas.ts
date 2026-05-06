import { z } from 'zod'

export const sendMessageSchema = z.object({
  client_id: z.string().uuid('Cliente inválido'),
  content: z.string().min(1, 'Mensagem obrigatória').max(1000),
  template_used: z.string().optional().nullable(),
})

export const broadcastSchema = z.object({
  group: z.enum(['birthday_month', 'inactive_30', 'loyalty_complete', 'all_active']),
  template_key: z.enum([
    'LEMBRETE_AGENDAMENTO',
    'CONFIRMACAO_AGENDAMENTO',
    'ANIVERSARIO',
    'FIDELIDADE_PRONTA',
    'INATIVO',
  ]),
  content: z.string().min(1),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type BroadcastInput = z.infer<typeof broadcastSchema>
