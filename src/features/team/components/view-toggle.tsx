'use client'

import { SquaresFour, List } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'

interface ViewToggleProps {
  view: 'cards' | 'table'
  setView: (v: 'cards' | 'table') => void
}

export function ViewToggle({ view, setView }: ViewToggleProps) {
  return (
    <div className="flex p-[3px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] items-center">
      <button
        onClick={() => setView('cards')}
        className={cn(
          "w-[32px] h-[28px] rounded-[5px] flex items-center justify-center transition-all duration-300",
          view === 'cards'
            ? "bg-[#1c1c1c] text-text-secondary"
            : "text-[#3d3d3d] hover:text-text-nav"
        )}
        title="Visualização em cards"
      >
        <SquaresFour size={15} weight={view === 'cards' ? 'fill' : 'regular'} />
      </button>
      <button
        onClick={() => setView('table')}
        className={cn(
          "w-[32px] h-[28px] rounded-[5px] flex items-center justify-center transition-all duration-300",
          view === 'table'
            ? "bg-[#1c1c1c] text-text-secondary"
            : "text-[#3d3d3d] hover:text-text-nav"
        )}
        title="Visualização em tabela"
      >
        <List size={15} weight={view === 'table' ? 'fill' : 'regular'} />
      </button>
    </div>
  )
}
