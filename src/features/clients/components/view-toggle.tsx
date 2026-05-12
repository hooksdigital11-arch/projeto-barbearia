'use client'

import { cn } from '@/lib/utils/cn'
import { SquaresFour, List } from '@phosphor-icons/react'

interface ViewToggleProps {
  view: 'cards' | 'table'
  onViewChange: (view: 'cards' | 'table') => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
      <button
        onClick={() => onViewChange('cards')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
          view === 'cards'
            ? 'bg-accent-cyan/10 text-accent-cyan'
            : 'text-text-secondary hover:text-text-primary'
        )}
      >
        <SquaresFour size={14} weight={view === 'cards' ? 'fill' : 'duotone'} />
        Cards
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
          view === 'table'
            ? 'bg-accent-cyan/10 text-accent-cyan'
            : 'text-text-secondary hover:text-text-primary'
        )}
      >
        <List size={14} weight={view === 'table' ? 'fill' : 'duotone'} />
        Tabela
      </button>
    </div>
  )
}
