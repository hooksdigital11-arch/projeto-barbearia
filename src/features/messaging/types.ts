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

export interface MessageTemplate {
  id: string
  organization_id: string
  name: string
  description: string | null
  content: string
  trigger_type: string
  is_active: boolean
  is_system: boolean
  created_at: string
  updated_at: string
}

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
