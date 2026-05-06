export type ComandaItem = {
  id: string
  organization_id: string
  appointment_id: string | null
  client_id: string
  barber_id: string
  inventory_id: string | null
  item_type: 'service' | 'product'
  name: string
  quantity: number
  unit_price_cents: number
  total_cents: number
  paid: boolean
  paid_at: string | null
  payment_method: 'cash' | 'pix' | 'credit_card' | 'debit_card' | null
  created_at: string
}

export type ComandaItemWithRelations = ComandaItem & {
  client?: { id: string; full_name: string; phone: string | null }
  barber?: { id: string; full_name: string | null }
  appointment?: { id: string; start_time: string; status: string }
}
