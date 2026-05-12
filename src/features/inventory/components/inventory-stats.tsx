'use client'

import { useMemo } from 'react'
import { Package, Tag, Wrench, Warning, WarningCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import type { InventoryStats, InventoryItem } from '../types'

interface InventoryStatsCardsProps {
  stats: InventoryStats
  items: InventoryItem[]
  period: 'hoje' | 'semana' | 'mes' | 'ano'
  salesData: Map<string, { qtdVendida: number, faturamento: number }>
  isLoading?: boolean
}

export function InventoryStatsCards({ stats, items, period, salesData, isLoading }: InventoryStatsCardsProps) {
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
  }

  const totalRevenue = useMemo(() => {
    let total = 0
    items.forEach(item => {
      if (item.type === 'revenda') {
        const sale = salesData.get(item.id)
        if (sale) total += sale.faturamento
      }
    })
    return total
  }, [items, salesData])

  const kpis = [
    { label: 'TOTAL DE ITENS', value: stats.total, icon: Package, desc: 'Volume em estoque' },
    { 
      label: 'REVENDA', 
      value: stats.revenda, 
      icon: Tag, 
      desc: 'Itens para comércio',
      revenue: formatPrice(totalRevenue)
    },
    { label: 'USO INTERNO', value: stats.usoInterno, icon: Wrench, desc: 'Insumos e materiais' },
    { 
      label: 'ALERTAS CRÍTICOS', 
      value: stats.lowStock, 
      icon: WarningCircle, 
      desc: stats.lowStock > 0 ? 'Estoque abaixo do mínimo' : 'Tudo sob controle',
      isWarning: stats.lowStock > 0
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px] px-[18px] flex flex-col justify-between h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-medium text-[#383838] tracking-[0.12em] uppercase">{kpi.label}</span>
            <kpi.icon size={14} weight="regular" className="text-accent-main opacity-35" />
          </div>
          <div className="space-y-1">
            <div className="text-[26px] text-text-primary font-medium flex items-center gap-1.5 leading-none">
              {isLoading ? '...' : kpi.value}
            </div>
            <div className="flex flex-col gap-0.5">
              <p className={cn(
                "text-[8px] tracking-[0.07em] font-medium uppercase",
                kpi.isWarning ? "text-red-500/60" : "text-[#2a2a2a]"
              )}>
                {kpi.desc}
              </p>
              {kpi.revenue && (
                <p className="text-[9px] text-accent-main tracking-[0.04em] font-medium">
                  {kpi.revenue}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
