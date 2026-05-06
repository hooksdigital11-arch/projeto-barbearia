import { Database } from './src/types/supabase'

type Tables = Database['public']['Tables']
type ComandaItems = Tables['comanda_items']

const test: ComandaItems['Row'] = {
  id: '1',
  organization_id: '1',
  appointment_id: null,
  client_id: '1',
  barber_id: '1',
  inventory_id: null,
  item_type: 'service',
  name: 'test',
  quantity: 1,
  unit_price_cents: 100,
  total_cents: 100,
  paid: false,
  paid_at: null,
  payment_method: null,
  created_at: '2021-01-01'
}

console.log(test)
