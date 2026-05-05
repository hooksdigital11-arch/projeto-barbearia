export interface LoyaltyConfig {
  mode: 'stamps' | 'points'
  stamps_required: number
  points_per_real: number
  points_required: number
  reward_service_id: string | null
  reward_description: string
}

export const DEFAULT_LOYALTY_CONFIG: LoyaltyConfig = {
  mode: 'stamps',
  stamps_required: 10,
  points_per_real: 1,
  points_required: 100,
  reward_service_id: null,
  reward_description: '1 corte grátis',
}

export interface StampRecord {
  id: string
  type: 'stamp' | 'redeem'
  amount: number
  notes: string | null
  created_at: string
  appointment_id: string | null
}

export interface ClientLoyalty {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  balance: number
  goal: number
  progress: number
  ready: boolean
}

export interface LoyaltyStats {
  totalClients: number
  readyToRedeem: number
  monthRedeems: number
  avgProgress: number
  goal: number
}
