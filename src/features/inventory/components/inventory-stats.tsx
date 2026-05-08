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

  // Calcular faturamento real total do período
  const totalRevenue = useMemo(() => {
    let total = 0
    items.forEach(item => {
      if (item.type === 'revenda') {
        const sale = salesData.get(item.id)
        if (sale) {
          total += sale.faturamento
        }
      }
    })
    return total
  }, [items, salesData])

  const Skeleton = () => (
    <div className="space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-white/5 animate-pulse" />
      <div className="space-y-2">
        <div className="w-24 h-2 bg-white/5 animate-pulse rounded" />
        <div className="w-16 h-8 bg-white/5 animate-pulse rounded" />
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Total Items */}
      <div className="p-6 rounded-[2.5rem] bg-accent-cyan/5 border border-white/5 backdrop-blur-xl space-y-4 hover:border-accent-cyan/20 transition-all duration-300 group">
        {isLoading ? <Skeleton /> : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan group-hover:scale-110 transition-transform duration-500">
              <Package size={26} weight="duotone" />
            </div>
            <div>
              <p className="text-[10px] font-black text-accent-cyan/60 uppercase tracking-[0.2em]">Total de Itens</p>
              <p className="text-4xl font-bold text-white font-syne mt-1">{stats.total}</p>
            </div>
          </>
        )}
      </div>

      {/* Revenda */}
      <div className="p-6 rounded-[2.5rem] bg-green-500/5 border border-white/5 backdrop-blur-xl space-y-4 hover:border-green-500/20 transition-all duration-300 group">
        {isLoading ? <Skeleton /> : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform duration-500">
              <Tag size={26} weight="duotone" />
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-green-400/60 uppercase tracking-[0.2em]">Revenda</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-4xl font-bold text-white font-syne">{stats.revenda}</p>
              </div>
              <div className="mt-3 p-3 rounded-2xl bg-black/20 border border-white/5">
                <p className="text-xs text-accent-cyan font-mono font-bold">
                  {formatPrice(totalRevenue)}
                </p>
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-1">faturamento {period}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Uso Interno */}
      <div className="p-6 rounded-[2.5rem] bg-blue-500/5 border border-white/5 backdrop-blur-xl space-y-4 hover:border-blue-500/20 transition-all duration-300 group">
        {isLoading ? <Skeleton /> : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-500">
              <Wrench size={26} weight="duotone" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.2em]">Uso Interno</p>
              <p className="text-4xl font-bold text-white font-syne mt-1">{stats.usoInterno}</p>
            </div>
          </>
        )}
      </div>

      {/* Alerts */}
      <div className={cn(
        "p-6 rounded-[2.5rem] border backdrop-blur-xl space-y-4 transition-all duration-500 group",
        stats.lowStock > 0 
          ? "bg-red-500/10 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]" 
          : "bg-white/5 border-white/5"
      )}>
        {isLoading ? <Skeleton /> : (
          <>
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
              stats.lowStock > 0 ? "bg-red-500/20 text-red-400" : "bg-white/10 text-muted-foreground"
            )}>
              <Warning size={26} weight={stats.lowStock > 0 ? "fill" : "duotone"} />
            </div>
            <div>
              <p className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em]",
                stats.lowStock > 0 ? "text-red-400/60" : "text-muted-foreground/60"
              )}>Alertas Críticos</p>
              <p className={cn(
                "text-4xl font-bold font-syne mt-1",
                stats.lowStock > 0 ? "text-red-400" : "text-white"
              )}>{stats.lowStock}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
