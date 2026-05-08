'use client'

import { createClient } from '@/lib/supabase/client'

export interface SalesData {
  qtdVendida: number
  faturamento: number
}

export type SalesMap = Map<string, SalesData>

export function useInventoryMovements() {
  const supabase = createClient()

  async function fetchSalesByPeriod(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SalesMap> {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('inventory_id, quantity, unit_price_cents')
      .eq('organization_id', organizationId)
      .eq('type', 'venda')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (error) {
      console.error('[fetchSalesByPeriod]', error.message)
      return new Map()
    }

    const salesMap = new Map<string, SalesData>()

    data.forEach((movement: any) => {
      const id = movement.inventory_id
      const qty = movement.quantity || 0
      const price = movement.unit_price_cents || 0
      const revenue = qty * price

      const existing = salesMap.get(id) || { qtdVendida: 0, faturamento: 0 }
      salesMap.set(id, {
        qtdVendida: existing.qtdVendida + qty,
        faturamento: existing.faturamento + revenue
      })
    })

    return salesMap
  }

  async function registerMovement(data: {
    organization_id: string
    inventory_id: string
    type: 'venda' | 'uso_interno' | 'entrada' | 'ajuste'
    quantity: number
    unit_price_cents: number | null
    notes?: string
  }) {
    const { error } = await supabase
      .from('inventory_movements')
      .insert(data)

    if (error) {
      throw new Error(error.message)
    }
  }

  return {
    fetchSalesByPeriod,
    registerMovement
  }
}
