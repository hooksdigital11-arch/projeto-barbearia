'use client'

import { SquaresFour, List } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'

interface ViewToggleProps {
  view: 'cards' | 'table'
  setView: (v: 'cards' | 'table') => void
}

export function ViewToggle({ view, setView }: ViewToggleProps) {
  return (
    <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl">
      <button
        onClick={() => setView('cards')}
        className={cn(
          "p-2 rounded-lg transition-all",
          view === 'cards'
            ? "bg-accent-cyan text-black"
            : "text-muted-foreground hover:text-white"
        )}
        title="Visualização em cards"
      >
        <SquaresFour size={18} weight={view === 'cards' ? 'fill' : 'regular'} />
      </button>
      <button
        onClick={() => setView('table')}
        className={cn(
          "p-2 rounded-lg transition-all",
          view === 'table'
            ? "bg-accent-cyan text-black"
            : "text-muted-foreground hover:text-white"
        )}
        title="Visualização em tabela"
      >
        <List size={18} weight={view === 'table' ? 'fill' : 'regular'} />
      </button>
    </div>
  )
}
