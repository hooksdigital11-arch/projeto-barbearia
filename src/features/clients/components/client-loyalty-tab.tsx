import { cn } from '@/lib/utils/cn'
import { Star, Gift, CheckSquare } from '@phosphor-icons/react/dist/ssr'
import type { StampRecord } from '../types'

interface ClientLoyaltyTabProps {
  stamps: StampRecord[]
  stampBalance: number
  goal: number
}

export function ClientLoyaltyTab({ stamps, stampBalance, goal }: ClientLoyaltyTabProps) {
  const progress = Math.min(Math.round((stampBalance / goal) * 100), 100)
  const remaining = Math.max(goal - stampBalance, 0)

  return (
    <div className="space-y-6">
      {/* Stamp card visual */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Star size={16} weight="duotone" className="text-yellow-400" />
            Cartão de Fidelidade
          </h4>
          <span className="text-sm font-bold text-text-primary">
            {stampBalance}/{goal}
          </span>
        </div>

        {/* Visual stamps */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: goal }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center border transition-all',
                i < stampBalance
                  ? 'bg-accent-cyan/20 border-accent-cyan/40 text-accent-cyan'
                  : 'bg-white/5 border-white/10 text-text-primary/10'
              )}
            >
              <CheckSquare
                size={16}
                weight={i < stampBalance ? 'fill' : 'thin'}
              />
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent-cyan transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary">
            {remaining > 0
              ? `Faltam ${remaining} para a recompensa`
              : '🎉 Pronto para resgatar!'
            }
          </p>
        </div>
      </div>

      {/* History */}
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-3">Histórico de carimbos</h4>
        {stamps.length === 0 ? (
          <p className="text-xs text-text-secondary text-center py-6">Nenhum carimbo registrado</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {stamps.slice(0, 20).map(stamp => (
              <div
                key={stamp.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5"
              >
                <div className="flex items-center gap-2">
                  {stamp.type === 'redeem' ? (
                    <Gift size={14} weight="duotone" className="text-yellow-400" />
                  ) : (
                    <Star size={14} weight="duotone" className="text-accent-cyan" />
                  )}
                  <span className="text-xs text-text-primary">{stamp.notes || (stamp.type === 'redeem' ? 'Resgate' : 'Carimbo')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'text-xs font-bold',
                    stamp.type === 'redeem' ? 'text-yellow-400' : 'text-emerald-400'
                  )}>
                    {stamp.type === 'redeem' ? `-${stamp.amount}` : `+${stamp.amount}`}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    {new Date(stamp.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
