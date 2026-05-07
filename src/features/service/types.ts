import { Database } from '@/types/database'

export type Service = Database['public']['Tables']['services']['Row']

export type ServiceCategory = 'corte' | 'barba' | 'combo' | 'outros'

export interface ServiceWithStats extends Service {
  appointment_count?: number
}

export const CATEGORY_CONFIG: Record<ServiceCategory, { label: string; color: string }> = {
  corte: { label: 'Corte', color: '#3b82f6' },
  barba: { label: 'Barba', color: '#f59e0b' },
  combo: { label: 'Combo', color: '#10b981' },
  outros: { label: 'Outros', color: '#8b5cf6' },
}
