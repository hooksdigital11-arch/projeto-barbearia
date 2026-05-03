import type { Database } from '@/types/supabase'

export type AppointmentRow = Database['public']['Tables']['appointments']['Row']

export interface Appointment extends Omit<AppointmentRow, 'organization_id' | 'created_at'> {
  client: {
    id: string
    name: string
    phone: string | null
  }
  service: {
    id: string
    name: string
    price_cents: number
  }
  barber: {
    id: string
    full_name: string
  }
}
