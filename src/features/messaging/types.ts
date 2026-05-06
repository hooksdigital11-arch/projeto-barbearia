export type MessageDirection = 'sent' | 'received'
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'

export interface Message {
  id: string
  organization_id: string
  client_id: string
  channel: string
  direction: MessageDirection
  content: string
  template_used: string | null
  status: MessageStatus
  error_message: string | null
  sent_by: string | null
  created_at: string
  client?: {
    id: string
    full_name: string
    phone: string | null
  }
  sender?: {
    id: string
    full_name: string
  } | null
}

export interface MessageConversation {
  client_id: string
  client_name: string
  client_phone: string | null
  last_message: string
  last_message_at: string
  unread_count: number
  total_count: number
}

export interface MessagingStats {
  today: number
  week: number
  month: number
  failed: number
}

export interface ClientForMessage {
  id: string
  full_name: string
  phone: string | null
  last_visit_at: string | null
  birthday: string | null
  status: string
}

export type TemplateKey =
  | 'LEMBRETE_AGENDAMENTO'
  | 'CONFIRMACAO_AGENDAMENTO'
  | 'ANIVERSARIO'
  | 'FIDELIDADE_PRONTA'
  | 'INATIVO'

export interface TemplateConfig {
  key: TemplateKey
  label: string
  description: string
  content: string
}

export const TEMPLATES: TemplateConfig[] = [
  {
    key: 'LEMBRETE_AGENDAMENTO',
    label: 'Lembrete de Agendamento',
    description: 'Enviado 1 dia antes do horário',
    content: 'Olá [NOME]! Lembrando seu agendamento amanhã às [HORA] com [BARBEIRO]. Até lá! 💈 Barbearia [NOME_BARBEARIA]',
  },
  {
    key: 'CONFIRMACAO_AGENDAMENTO',
    label: 'Confirmação de Agendamento',
    description: 'Enviado ao confirmar',
    content: 'Olá [NOME]! Seu agendamento foi confirmado para [DATA] às [HORA] com [BARBEIRO]. Qualquer dúvida, fale conosco! ✂️',
  },
  {
    key: 'ANIVERSARIO',
    label: 'Feliz Aniversário',
    description: 'Para aniversariantes do mês',
    content: 'Feliz aniversário, [NOME]! 🎉 Como presente, você ganhou um desconto especial na próxima visita. Venha nos visitar! 💈 Barbearia [NOME_BARBEARIA]',
  },
  {
    key: 'FIDELIDADE_PRONTA',
    label: 'Fidelidade Completa',
    description: 'Ao completar carimbos',
    content: 'Parabéns [NOME]! Você completou seus carimbos de fidelidade e ganhou um serviço grátis! Agende agora e aproveite! 🎁 Barbearia [NOME_BARBEARIA]',
  },
  {
    key: 'INATIVO',
    label: 'Cliente Inativo',
    description: 'Para clientes sem visita há +30 dias',
    content: 'Sentimos sua falta, [NOME]! Faz um tempo que você não nos visita. Que tal agendar um horário? ✂️ Barbearia [NOME_BARBEARIA]',
  },
]

export type BroadcastGroup =
  | 'birthday_month'
  | 'inactive_30'
  | 'loyalty_complete'
  | 'all_active'

export const BROADCAST_GROUPS: { id: BroadcastGroup; label: string }[] = [
  { id: 'birthday_month', label: 'Aniversariantes do mês' },
  { id: 'inactive_30', label: 'Clientes inativos (+30 dias)' },
  { id: 'loyalty_complete', label: 'Fidelidade completa' },
  { id: 'all_active', label: 'Todos os clientes ativos' },
]
