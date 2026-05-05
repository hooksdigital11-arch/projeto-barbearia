/** Status possíveis de uma entrada na fila de espera */
export type WaitingListStatus =
  | 'waiting'
  | 'notified'
  | 'confirmed'
  | 'served'
  | 'expired'
  | 'left'

/** Registro completo da fila com joins */
export interface WaitingListEntry {
  id: string
  organization_id: string
  client_id: string
  barber_id: string | null
  service_id: string
  position: number
  status: WaitingListStatus
  estimated_wait_minutes: number | null
  arrived_at: string | null
  called_at: string | null
  served_at: string | null
  expires_at: string | null
  whatsapp_sent: boolean
  appointment_id: string | null
  created_at: string
  client: {
    id: string
    full_name: string
    phone: string | null
  } | null
  barber: {
    id: string
    full_name: string
  } | null
  service: {
    id: string
    name: string
    duration_minutes: number
  } | null
}

/** Stats da fila (KPI cards) */
export interface QueueStats {
  waiting: number
  notified: number
  confirmed: number
  openSlots: number
}

/** Dados para link WhatsApp */
export interface WhatsAppData {
  phone: string | null
  clientName: string | null
  serviceName: string | null
  barberName: string
  expiresAt: string
}

/** Serviço disponível (para dropdown) */
export interface ServiceOption {
  id: string
  name: string
  duration_minutes: number
}

/** Barbeiro disponível (para dropdown) */
export interface BarberOption {
  id: string
  full_name: string
}

/** Cliente disponível (para dropdown) */
export interface ClientOption {
  id: string
  full_name: string
  phone: string | null
}
