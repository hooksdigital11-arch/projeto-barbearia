'use client'

import { Stamp, Gift, ArrowDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import type { StampRecord } from '../types'

interface LoyaltyHistoryProps {
  history: StampRecord[]
  showMax?: number
}

export function LoyaltyHistory({ history, showMax = 20 }: LoyaltyHistoryProps) {
  const items = history.slice(0, showMax)

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 text-muted-foreground/30">
          <Stamp size={24} weight="duotone" />
        </div>
        <p className="text-white font-bold">Nenhum registro ainda</p>
        <p className="text-sm text-muted-foreground">Seu histórico de fidelidade aparecerá aqui.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isRedeem = item.type === 'redeem'
        const date = new Date(item.created_at)
        const formatted = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

        return (
          <div
            key={item.id}
            className={cn(
              "flex items-center justify-between py-3 px-4 rounded-xl border transition-all",
              isRedeem
                ? "bg-green-500/5 border-green-500/10"
                : item.amount < 0
                  ? "bg-red-500/5 border-red-500/10"
                  : "bg-white/[0.02] border-white/5"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isRedeem ? "bg-green-500/20 text-green-400" : item.amount < 0 ? "bg-red-500/20 text-red-400" : "bg-accent-cyan/20 text-accent-cyan"
              )}>
                {isRedeem ? <Gift size={16} weight="fill" /> : item.amount < 0 ? <ArrowDown size={16} weight="bold" /> : <Stamp size={16} weight="fill" />}
              </div>
              <div>
                <p className="text-sm text-white font-medium">
                  {isRedeem ? '🎁 Resgate' : item.amount < 0 ? `${item.amount} carimbo` : `+${item.amount} carimbo${item.amount > 1 ? 's' : ''}`}
                </p>
                {item.notes && (
                  <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">{item.notes}</p>
                )}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{formatted}</span>
          </div>
        )
      })}
    </div>
  )
}
