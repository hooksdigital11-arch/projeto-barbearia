'use client'

import { cn } from '@/lib/utils/cn'
import type { LoyaltyConfig } from '../types'

interface StampCardProps {
  balance: number
  config: LoyaltyConfig
}

export function StampCard({ balance, config }: StampCardProps) {
  const goal = config.mode === 'stamps' ? config.stamps_required : config.points_required
  const progress = Math.min(Math.round((balance / goal) * 100), 100)
  const isReady = balance >= goal

  if (config.mode === 'points') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{balance} / {goal} pontos</span>
          <span className="text-sm font-bold text-accent-cyan">{progress}%</span>
        </div>
        <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              isReady
                ? "bg-gradient-to-r from-green-500 to-emerald-400 animate-pulse"
                : "bg-gradient-to-r from-accent-cyan to-cyan-400"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        {isReady ? (
          <p className="text-green-400 text-sm font-bold text-center">🎉 Meta atingida! Resgate disponível!</p>
        ) : (
          <p className="text-muted-foreground text-sm text-center">
            Faltam <span className="text-text-primary font-bold">{goal - balance}</span> pontos para: <span className="text-accent-cyan font-bold">&quot;{config.reward_description}&quot;</span>
          </p>
        )}
      </div>
    )
  }

  // Modo carimbos — visual com quadradinhos
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {Array.from({ length: goal }).map((_, i) => {
          const isFilled = i < balance
          return (
            <div
              key={i}
              className={cn(
                "w-[38px] h-[38px] rounded-xl flex items-center justify-center transition-all duration-300",
                isFilled
                  ? "bg-accent-cyan/90 shadow-[0_0_12px_rgba(0,229,255,0.5)] scale-100"
                  : "bg-white/5 border border-white/10 scale-95 opacity-40"
              )}
              style={{
                animationDelay: isFilled ? `${i * 50}ms` : undefined,
              }}
            >
              {isFilled ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span className="text-[10px] text-text-primary/20 font-bold">{i + 1}</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="text-center space-y-1">
        <p className="text-text-primary font-bold text-lg">{balance} / {goal} carimbos</p>
        {isReady ? (
          <p className="text-green-400 text-sm font-bold">🎉 Meta atingida! Resgate disponível!</p>
        ) : (
          <p className="text-muted-foreground text-sm">
            Faltam <span className="text-text-primary font-bold">{goal - balance}</span> para: <span className="text-accent-cyan font-bold">&quot;{config.reward_description}&quot;</span>
          </p>
        )}
      </div>
    </div>
  )
}
