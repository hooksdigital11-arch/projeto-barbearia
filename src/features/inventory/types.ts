export interface InventoryItem {
  id: string
  organization_id: string
  name: string
  description?: string | null
  category: string
  type: string
  quantity: number
  min_quantity: number | null
  cost_cents?: number | null
  price_cents?: number | null
  supplier?: string | null
  supplier_phone?: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface InventoryStats {
  total: number
  revenda: number
  usoInterno: number
  lowStock: number
  inactive: number
}

export type InventoryCategory = 
  | 'pomada' 
  | 'shampoo' 
  | 'lamina' 
  | 'tesoura' 
  | 'oleo' 
  | 'creme' 
  | 'outros'

export type InventoryType = 'revenda' | 'uso_interno'
