'use client'

import { useMemo } from 'react'
import { Package, Tag, Wrench, Warning } from '@phosphor-icons/react'
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
    { label: 'Total de Itens', value: stats.total, icon: Package, color: '#8b5cf6', desc: 'Volume em estoque' },
    { 
      label: 'Revenda', 
      value: stats.revenda, 
      icon: Tag, 
      color: '#10b981', 
      desc: `Faturamento: ${formatPrice(totalRevenue)}`,
      subDesc: `Período: ${period}`
    },
    { label: 'Uso Interno', value: stats.usoInterno, icon: Wrench, color: '#3b82f6', desc: 'Insumos e materiais' },
    { 
      label: 'Alertas Críticos', 
      value: stats.lowStock, 
      icon: Warning, 
      color: stats.lowStock > 0 ? '#ef4444' : '#a0a0a0', 
      desc: stats.lowStock > 0 ? 'Estoque abaixo do mínimo' : 'Tudo sob controle' 
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 overflow-hidden">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="p-10 bg-black flex flex-col justify-between h-48 group">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
              {kpi.label}
            </p>
            <kpi.icon size={20} weight="bold" style={{ color: kpi.color }} className="opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className={cn(
                "text-5xl font-bold font-mono tracking-tighter group-hover:text-accent-cyan transition-colors",
                kpi.label === 'Alertas Críticos' && stats.lowStock > 0 ? "text-red-400" : "text-white"
              )}>
                {isLoading ? '...' : kpi.value}
              </p>
            </div>
            <div className="mt-2 space-y-0.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-30 group-hover:opacity-60 transition-opacity">
                {kpi.desc}
              </p>
              {kpi.subDesc && (
                <p className="text-[8px] text-accent-cyan/60 uppercase tracking-widest font-black">
                  {kpi.subDesc}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
