'use client'

import { useState, useTransition } from 'react'
import { Gear, FloppyDisk, CircleNotch, Stamp, Star } from '@phosphor-icons/react'
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
    <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[10px] p-[20px] px-[22px]">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-[32px] h-[32px] bg-bg-surface border-[0.5px] border-border-main rounded-[7px] flex items-center justify-center text-text-nav">
          <Gear size={16} weight="regular" />
        </div>
        <div>
          <h2 className="text-[13px] font-medium text-text-secondary uppercase tracking-tight">Configuração do Programa</h2>
          <p className="text-[10px] text-[#333] font-medium uppercase tracking-wide">Defina as regras de fidelização</p>
        </div>
      </div>

      <div className="h-[0.5px] bg-[#161616] w-full mb-[20px]" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Toggle Carimbos / Pontos */}
        <div className="space-y-3">
          <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Modelo do Programa</label>
          <div className="grid grid-cols-2 gap-[6px]">
            <button
              type="button"
              onClick={() => setMode('stamps')}
              className={cn(
                "flex items-center justify-center gap-2 py-[11px] rounded-[8px] border-[0.5px] text-[11px] font-medium uppercase tracking-[0.08em] transition-all",
                mode === 'stamps'
                  ? "bg-bg-surface border-[#2a2a2a] text-text-secondary"
                  : "bg-bg-sidebar border-border-main text-[#444] hover:text-[#666]"
              )}
            >
              <Stamp size={14} weight="regular" />
              Carimbos
            </button>
            <button
              type="button"
              onClick={() => setMode('points')}
              className={cn(
                "flex items-center justify-center gap-2 py-[11px] rounded-[8px] border-[0.5px] text-[11px] font-medium uppercase tracking-[0.08em] transition-all",
                mode === 'points'
                  ? "bg-bg-surface border-[#2a2a2a] text-text-secondary"
                  : "bg-bg-sidebar border-border-main text-[#444] hover:text-[#666]"
              )}
            >
              <Star size={14} weight="regular" />
              Pontos
            </button>
          </div>
          <input type="hidden" name="mode" value={mode} />
        </div>

        {/* Configurações dinâmicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mode === 'stamps' ? (
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">
                Carimbos para resgatar <span className="text-accent-main">*</span>
              </label>
              <input
                name="stamps_required"
                type="number"
                min={1}
                max={50}
                value={stampsRequired}
                onChange={(e) => setStampsRequired(e.target.value)}
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20"
              />
              <p className="text-[9px] text-[#2a2a2a] tracking-[0.04em] font-medium uppercase">
                O cliente precisará de {stampsRequired || '10'} carimbos para o resgate.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">
                  Pontos por R$1 <span className="text-accent-main">*</span>
                </label>
                <input
                  name="points_per_real"
                  type="number"
                  min={1}
                  max={10}
                  value={pointsPerReal}
                  onChange={(e) => setPointsPerReal(e.target.value)}
                  className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">
                  Pontos para resgatar <span className="text-accent-main">*</span>
                </label>
                <input
                  name="points_required"
                  type="number"
                  min={1}
                  max={10000}
                  value={pointsRequired}
                  onChange={(e) => setPointsRequired(e.target.value)}
                  className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20"
                />
              </div>
            </>
          )}

          {/* Descrição da recompensa */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">
              Descrição da Recompensa <span className="text-accent-main">*</span>
            </label>
            <input
              name="reward_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: 1 CORTE GRÁTIS"
              required
              className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 uppercase"
            />
            <p className="text-[9px] text-[#2a2a2a] tracking-[0.04em] font-medium uppercase">Exibido para o cliente no painel de fidelidade.</p>
          </div>
        </div>

        {/* Hidden inputs for the inactive mode */}
        {mode === 'stamps' ? (
          <>
            <input type="hidden" name="points_per_real" value={pointsPerReal} />
            <input type="hidden" name="points_required" value={pointsRequired} />
          </>
        ) : (
          <input type="hidden" name="stamps_required" value={stampsRequired} />
        )}
        <input type="hidden" name="reward_service_id" value="" />

        <div className="flex justify-end pt-2">
          <button
            disabled={isPending}
            type="submit"
            className="flex items-center gap-2 bg-accent-main text-black px-[18px] py-[10px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            {isPending ? (
              <CircleNotch size={14} className="animate-spin" />
            ) : (
              <FloppyDisk size={14} weight="bold" />
            )}
            Salvar Configuração
          </button>
        </div>
      </form>
    </div>
  )
}
