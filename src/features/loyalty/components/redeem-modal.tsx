'use client'

import { useState, useTransition } from 'react'
import { X, Gift, Sparkle, Ticket, CircleNotch } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { redeemReward } from '../actions'
import { toast } from 'sonner'
import type { LoyaltyConfig } from '../types'

interface RedeemModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string
  config: LoyaltyConfig
}

export function RedeemModal({ isOpen, onClose, clientId, config }: RedeemModalProps) {
  const [isPending, startTransition] = useTransition()
  const [redeemed, setRedeemed] = useState(false)
  const [code, setCode] = useState('')

  if (!isOpen) return null

  function handleRedeem() {
    startTransition(async () => {
      const result = await redeemReward(clientId)
      if (result.success && result.code) {
        setCode(result.code)
        setRedeemed(true)
        toast.success('Resgate confirmado! 🎉')
      } else {
        toast.error(result.error || 'Erro ao resgatar')
      }
    })
  }

  function handleClose() {
    setRedeemed(false)
    setCode('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg-surface border border-white/10 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
        {!redeemed ? (
          <>
            {/* Pre-redeem */}
            <div className="w-20 h-20 rounded-3xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <Gift size={40} weight="duotone" className="text-green-400" />
            </div>
            <h3 className="text-2xl font-bold font-syne text-text-primary mb-2">Resgatar Recompensa</h3>
            <p className="text-muted-foreground mb-6">
              Você atingiu a meta! Tem direito a:
            </p>
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 mb-6">
              <p className="text-green-400 font-bold text-lg">&quot;{config.reward_description}&quot;</p>
            </div>
            <p className="text-xs text-muted-foreground mb-8">
              Após o resgate, seus carimbos serão zerados e um novo ciclo começará. Apresente o código ao barbeiro no dia do atendimento.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleClose} className="flex-1 rounded-2xl py-6 text-muted-foreground hover:text-text-primary">
                Cancelar
              </Button>
              <Button
                disabled={isPending}
                onClick={handleRedeem}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-text-primary font-bold gap-2 rounded-2xl py-6 text-base shadow-lg shadow-green-500/20"
              >
                {isPending ? <CircleNotch size={24} className="animate-spin" /> : <Gift size={24} />}
                Confirmar Resgate
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Post-redeem */}
            <div className="w-20 h-20 rounded-3xl bg-green-500/10 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Sparkle size={40} weight="duotone" className="text-green-400" />
            </div>
            <h3 className="text-2xl font-bold font-syne text-text-primary mb-2">🎉 Parabéns!</h3>
            <p className="text-muted-foreground mb-6">
              Resgate confirmado com sucesso!
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Seu código de resgate</p>
              <div className="flex items-center justify-center gap-2">
                <Ticket size={20} className="text-accent-cyan" />
                <span className="text-2xl font-mono font-bold text-accent-cyan tracking-wider">{code}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              Apresente este código ao barbeiro no dia do atendimento.
            </p>
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6">
              <p className="text-green-400 font-bold">{config.reward_description}</p>
            </div>
            <Button onClick={handleClose} className="w-full bg-accent-cyan hover:bg-cyan-400 text-black font-bold rounded-2xl py-6 text-base">
              Fechar
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
