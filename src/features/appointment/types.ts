export type AppointmentStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export interface AppointmentWithRelations {
  id: string
  organization_id: string
  client_id: string
  barber_id: string
  service_id: string
  start_time: string
  end_time: string
  duration_minutes: number
  status: AppointmentStatus
  price_cents: number
  notes: string | null
  rating: number | null
  created_at: string
  confirmacao_etapa?: string | null
  client: {
    id: string
    full_name: string
    phone: string | null
  }
  barber: {
    id: string
    full_name: string
  }
  service: {
    id: string
    name: string
    price_cents: number
  }
}

export interface AppointmentStats {
  total: number
  confirmed: number
  completed: number
  cancelled: number
  revenue: number
}

export interface ServiceOption {
  id: string
  name: string
  price_cents: number
  duration_minutes: number
}

export interface BarberOption {
  id: string
  full_name: string
  status?: string | null
}

export interface ClientOption {
  id: string
  full_name: string
  phone: string | null
}

export const BARBER_COLORS: Record<string, string> = {
  default: '#00e5ff',
}

export const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; color: string; bg: string }
> = {
  scheduled: { label: 'Agendado', color: '#a0a0a0', bg: 'bg-white/10' },
  in_progress: { label: 'Em Andamento', color: '#f59e0b', bg: 'bg-yellow-500/20' },
  completed: { label: 'Concluído', color: '#10b981', bg: 'bg-emerald-500/20' },
  cancelled: { label: 'Cancelado', color: '#ef4444', bg: 'bg-red-500/20' },
  no_show: { label: 'No-show', color: '#6b7280', bg: 'bg-gray-500/20' },
}
