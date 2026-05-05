'use client'

import { Package, Tag, Wrench, Warning } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import type { InventoryStats } from '../types'

export function InventoryStatsCards({ stats }: { stats: InventoryStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="p-6 rounded-[2rem] bg-accent-cyan/5 border border-accent-cyan/10 space-y-3">
        <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
          <Package size={24} weight="duotone" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-accent-cyan/60 uppercase tracking-widest">Total de Itens</p>
          <p className="text-3xl font-bold text-white font-syne">{stats.total}</p>
        </div>
      </div>

      <div className="p-6 rounded-[2rem] bg-green-500/5 border border-green-500/10 space-y-3">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
          <Tag size={24} weight="duotone" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-green-400/60 uppercase tracking-widest">Revenda</p>
          <p className="text-3xl font-bold text-white font-syne">{stats.revenda}</p>
        </div>
      </div>

      <div className="p-6 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 space-y-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
          <Wrench size={24} weight="duotone" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest">Uso Interno</p>
          <p className="text-3xl font-bold text-white font-syne">{stats.usoInterno}</p>
        </div>
      </div>

      <div className={cn(
        "p-6 rounded-[2rem] border space-y-3 transition-all duration-500",
        stats.lowStock > 0 
          ? "bg-red-500/10 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]" 
          : "bg-white/5 border-white/5"
      )}>
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          stats.lowStock > 0 ? "bg-red-500/20 text-red-400" : "bg-white/10 text-muted-foreground"
        )}>
          <Warning size={24} weight={stats.lowStock > 0 ? "fill" : "duotone"} />
        </div>
        <div>
          <p className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            stats.lowStock > 0 ? "text-red-400/60" : "text-muted-foreground/60"
          )}>Alertas</p>
          <p className={cn(
            "text-3xl font-bold font-syne",
            stats.lowStock > 0 ? "text-red-400" : "text-white"
          )}>{stats.lowStock}</p>
        </div>
      </div>
    </div>
  )
}
