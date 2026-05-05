'use client'

import { Warning, ArrowRight } from '@phosphor-icons/react'

export function LowStockAlert({ count, onFilter }: { count: number, onFilter: () => void }) {
  if (count === 0) return null

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
          <Warning size={20} weight="fill" />
        </div>
        <p className="text-sm font-medium text-amber-200">
          <strong className="text-amber-500 font-bold">{count}</strong> produtos estão com estoque baixo ou zerado.
        </p>
      </div>
      <button 
        onClick={onFilter}
        className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-widest"
      >
        Ver todos
        <ArrowRight size={14} weight="bold" />
      </button>
    </div>
  )
}
