'use client'

import { useState, useTransition } from 'react'
import { Gear, FloppyDisk, CircleNotch } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CustomSelect } from '@/components/ui/custom-select'
import { updateLoyaltyConfig } from '../actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import type { LoyaltyConfig } from '../types'

interface LoyaltyConfigPanelProps {
  config: LoyaltyConfig
}

export function LoyaltyConfigPanel({ config }: LoyaltyConfigPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState(config.mode)
  const [stampsRequired, setStampsRequired] = useState(String(config.stamps_required || 10))
  const [pointsPerReal, setPointsPerReal] = useState(String(config.points_per_real || 1))
  const [pointsRequired, setPointsRequired] = useState(String(config.points_required || 100))
  const [description, setDescription] = useState(config.reward_description)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updateLoyaltyConfig(formData)
      if (result.success) {
        toast.success('Configuração salva com sucesso!')
      } else {
        toast.error(result.error || 'Erro ao salvar')
      }
    })
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
          <Gear size={22} weight="duotone" />
        </div>
        <div>
          <h2 className="text-lg font-bold font-syne text-white">Configuração do Programa</h2>
          <p className="text-xs text-muted-foreground">Defina como funciona o programa de fidelidade.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Modo */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Modelo do Programa</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMode('stamps')}
              className={cn(
                "flex-1 py-4 rounded-2xl border text-sm font-bold uppercase tracking-widest transition-all",
                mode === 'stamps'
                  ? "bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan"
                  : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
              )}
            >
              🎟️ Carimbos
            </button>
            <button
              type="button"
              onClick={() => setMode('points')}
              className={cn(
                "flex-1 py-4 rounded-2xl border text-sm font-bold uppercase tracking-widest transition-all",
                mode === 'points'
                  ? "bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan"
                  : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
              )}
            >
              ⭐ Pontos
            </button>
          </div>
          <input type="hidden" name="mode" value={mode} />
        </div>

        {/* Configurações dinâmicas por modo */}
        {mode === 'stamps' ? (
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Carimbos para resgatar</label>
            <Input
              name="stamps_required"
              type="number"
              min={1}
              max={50}
              value={stampsRequired}
              onChange={(e) => setStampsRequired(e.target.value)}
              className="bg-white/5 border-white/10 rounded-xl h-12"
            />
            <p className="text-[10px] text-muted-foreground">O cliente precisará de {stampsRequired || '10'} carimbos para resgatar a recompensa.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Pontos por R$1</label>
              <Input
                name="points_per_real"
                type="number"
                min={1}
                max={10}
                value={pointsPerReal}
                onChange={(e) => setPointsPerReal(e.target.value)}
                className="bg-white/5 border-white/10 rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Pontos para resgatar</label>
              <Input
                name="points_required"
                type="number"
                min={1}
                max={10000}
                value={pointsRequired}
                onChange={(e) => setPointsRequired(e.target.value)}
                className="bg-white/5 border-white/10 rounded-xl h-12"
              />
            </div>
          </div>
        )}

        {/* Campos ocultos para o modo não ativo (precisam ser enviados) */}
        {mode === 'stamps' ? (
          <>
            <input type="hidden" name="points_per_real" value={pointsPerReal} />
            <input type="hidden" name="points_required" value={pointsRequired} />
          </>
        ) : (
          <input type="hidden" name="stamps_required" value={stampsRequired} />
        )}

        {/* Descrição da recompensa */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Descrição da Recompensa *</label>
          <Input
            name="reward_description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: 1 corte grátis"
            className="bg-white/5 border-white/10 rounded-xl h-12"
            required
          />
        </div>

        <input type="hidden" name="reward_service_id" value="" />

        <div className="flex justify-end">
          <Button disabled={isPending} type="submit" className="bg-accent-cyan hover:bg-cyan-400 text-black font-bold gap-2 rounded-2xl px-8 py-6 shadow-lg shadow-cyan-500/20">
            {isPending ? <CircleNotch size={20} className="animate-spin" /> : <FloppyDisk size={20} />}
            Salvar Configuração
          </Button>
        </div>
      </form>
    </div>
  )
}
