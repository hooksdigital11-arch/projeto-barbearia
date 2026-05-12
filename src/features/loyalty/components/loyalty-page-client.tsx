'use client'

import { useState } from 'react'
import { Stamp, Gift, ArrowsClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { StampCard } from './stamp-card'
import { LoyaltyHistory } from './loyalty-history'
import { RedeemModal } from './redeem-modal'
import type { LoyaltyConfig, StampRecord } from '../types'

interface LoyaltyPageClientProps {
  config: LoyaltyConfig
  balance: number
  history: StampRecord[]
  clientId: string
}

export function LoyaltyPageClient({ config, balance, history, clientId }: LoyaltyPageClientProps) {
  const [isRedeemOpen, setIsRedeemOpen] = useState(false)
  const goal = config.mode === 'stamps' ? config.stamps_required : config.points_required
  const isReady = balance >= goal
  const unit = config.mode === 'stamps' ? 'carimbos' : 'pontos'

  // Stats
  const totalEarned = history.filter(h => h.type === 'stamp' && h.amount > 0).reduce((s, h) => s + h.amount, 0)
  const totalRedeems = history.filter(h => h.type === 'redeem').length

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-syne text-text-primary tracking-tight">Minha Fidelidade</h1>
        <p className="text-muted-foreground mt-1 text-sm">Acompanhe seus carimbos e resgate suas recompensas.</p>
      </div>

      {/* Stamp Card */}
      <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
        {/* Decorative glow */}
        {isReady && (
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-green-500/10 blur-[80px] rounded-full pointer-events-none" />
        )}

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
            <Stamp size={22} weight="duotone" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-syne text-text-primary">Seu Cartão Fidelidade</h2>
            <p className="text-xs text-muted-foreground">
              {config.mode === 'stamps' ? `A cada visita, ganhe 1 carimbo` : `Acumule pontos a cada visita`}
            </p>
          </div>
        </div>

        <StampCard balance={balance} config={config} />

        {/* Redeem Button */}
        {isReady && (
          <div className="mt-6">
            <Button
              onClick={() => setIsRedeemOpen(true)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-text-primary font-bold gap-3 rounded-2xl py-7 text-base shadow-lg shadow-green-500/20 animate-pulse hover:animate-none"
            >
              <Gift size={24} weight="fill" />
              🎁 RESGATAR — {config.reward_description}
            </Button>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Acumulados</p>
          <p className="text-xl font-bold text-text-primary font-syne">{totalEarned}</p>
          <p className="text-[10px] text-muted-foreground">{unit}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Resgates</p>
          <p className="text-xl font-bold text-green-400 font-syne">{totalRedeems}</p>
          <p className="text-[10px] text-muted-foreground">realizados</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Próximo</p>
          <p className="text-xl font-bold text-accent-cyan font-syne">{isReady ? '🎉' : goal - balance}</p>
          <p className="text-[10px] text-muted-foreground">{isReady ? 'Disponível!' : `${unit} faltam`}</p>
        </div>
      </div>

      {/* History */}
      <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground">
            <ArrowsClockwise size={22} weight="duotone" />
          </div>
          <h2 className="text-lg font-bold font-syne text-text-primary">Histórico</h2>
        </div>
        <LoyaltyHistory history={history} />
      </div>

      {/* Redeem Modal */}
      <RedeemModal
        isOpen={isRedeemOpen}
        onClose={() => setIsRedeemOpen(false)}
        clientId={clientId}
        config={config}
      />
    </div>
  )
}
