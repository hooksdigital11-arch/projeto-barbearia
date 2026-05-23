'use client'

import { useState, useRef } from 'react'
import { MagnifyingGlass, X, FadersHorizontal } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'

interface Filters {
  category: string
  minQty: string
  maxQty: string
  lowStockOnly: boolean
}

interface InventoryFiltersProps {
  activeTab: 'all' | 'revenda' | 'uso_interno' | 'inactive'
  setActiveTab: (tab: 'all' | 'revenda' | 'uso_interno' | 'inactive') => void
  search: string
  setSearch: (s: string) => void
  filters: Filters
  setFilters: (f: Filters) => void
  period: 'hoje' | 'semana' | 'mes' | 'ano'
  setPeriod: (p: 'hoje' | 'semana' | 'mes' | 'ano') => void
}

const TABS = [
  { value: 'all' as const, label: 'TODOS' },
  { value: 'revenda' as const, label: 'REVENDA' },
  { value: 'uso_interno' as const, label: 'USO INTERNO' },
  { value: 'inactive' as const, label: 'INATIVOS' },
]

const PERIODS = [
  { value: 'hoje' as const, label: 'HOJE' },
  { value: 'semana' as const, label: 'ESTA SEMANA' },
  { value: 'mes' as const, label: 'ESTE MÊS' },
  { value: 'ano' as const, label: 'ESTE ANO' },
]

const CATEGORIES = ['POMADA', 'SHAMPOO', 'LAMINA', 'TESOURA', 'OLEO', 'CREME', 'OUTROS']

export function InventoryFilters({
  activeTab, setActiveTab, search, setSearch, filters, setFilters, period, setPeriod
}: InventoryFiltersProps) {
  const [showPanel, setShowPanel] = useState(false)
  const hasActiveFilters = filters.category || filters.minQty || filters.maxQty || filters.lowStockOnly

  const resetFilters = () => setFilters({ category: '', minQty: '', maxQty: '', lowStockOnly: false })

  const scrollRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el) return
    const startX = e.pageX - el.offsetLeft
    const scrollLeft = el.scrollLeft

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.pageX - el.offsetLeft
      const walk = (x - startX) * 1.5
      el.scrollLeft = scrollLeft - walk
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          className="flex items-center gap-4 overflow-x-auto scrollbar-none w-full pb-2 -mb-2 cursor-grab active:cursor-grabbing select-none"
        >
          {/* Grupo 1: Categorias/Status */}
          <div className="flex p-[3px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] shrink-0">
            {TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "px-4 py-2 rounded-[6px] text-[10px] font-medium uppercase tracking-[0.05em] transition-all",
                  activeTab === tab.value
                    ? "bg-[#1c1c1c] text-text-secondary"
                    : "text-[#333] hover:text-text-nav"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-[0.5px] h-[20px] bg-[#1a1a1a] shrink-0" />

          {/* Grupo 2: Período */}
          <div className="flex p-[3px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] shrink-0">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  "px-4 py-2 rounded-[6px] text-[10px] font-medium uppercase tracking-[0.05em] transition-all",
                  period === p.value
                    ? "bg-[#1c1c1c] text-text-secondary"
                    : "text-[#333] hover:text-text-nav"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] flex items-center px-[14px] w-full md:w-[240px]">
            <MagnifyingGlass size={14} className="text-[#2e2e2e] shrink-0" />
            <input
              type="text"
              placeholder="BUSCAR PRODUTO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none py-[9px] pl-[10px] text-[11px] text-text-secondary placeholder:text-[#2e2e2e] w-full font-medium"
            />
          </div>

          <button
            onClick={() => setShowPanel(!showPanel)}
            className={cn(
              "w-[34px] h-[34px] flex items-center justify-center rounded-[8px] border-[0.5px] transition-all relative shrink-0",
              showPanel || hasActiveFilters
                ? "bg-[#1c1c1c] border-[#2a2a2a] text-text-secondary"
                : "bg-bg-sidebar border-border-main text-[#333] hover:text-text-nav"
            )}
          >
            <FadersHorizontal size={16} weight={hasActiveFilters ? "fill" : "regular"} />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-main rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showPanel && (
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[10px] p-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[12px] font-medium text-text-secondary uppercase tracking-widest">Filtros Avançados</h3>
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[10px] text-red-500/60 hover:text-red-500 transition-colors flex items-center gap-1 font-medium uppercase tracking-wider"
                >
                  <X size={12} weight="bold" />
                  Limpar filtros
                </button>
              )}
              <button onClick={() => setShowPanel(false)} className="text-[#333] hover:text-text-primary transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1.1fr] gap-10">
            {/* Categoria */}
            <div className="space-y-3">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Categoria</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilters({ ...filters, category: filters.category === cat.toLowerCase() ? '' : cat.toLowerCase() })}
                    className={cn(
                      "px-3 py-1.5 rounded-[6px] text-[10px] font-medium uppercase tracking-wide border-[0.5px] transition-all",
                      filters.category === cat.toLowerCase()
                        ? "bg-[#1c1c1c] border-accent-main text-text-secondary"
                        : "bg-bg-sidebar border-border-main text-[#444] hover:text-[#666]"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantidade */}
            <div className="space-y-3">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Quantidade em Estoque</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="MÍN"
                  value={filters.minQty}
                  onChange={(e) => setFilters({ ...filters, minQty: e.target.value })}
                  className="flex-1 bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-3 py-2 text-[11px] text-text-secondary outline-none transition-all focus:border-accent-main/20"
                />
                <span className="text-[#1a1a1a] text-xs">—</span>
                <input
                  type="number"
                  placeholder="MÁX"
                  value={filters.maxQty}
                  onChange={(e) => setFilters({ ...filters, maxQty: e.target.value })}
                  className="flex-1 bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-3 py-2 text-[11px] text-text-secondary outline-none transition-all focus:border-accent-main/20"
                />
              </div>
            </div>

            {/* Estoque Baixo */}
            <div className="space-y-3">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Status de Estoque</label>
              <button
                onClick={() => setFilters({ ...filters, lowStockOnly: !filters.lowStockOnly })}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-[8px] border-[0.5px] transition-all",
                  filters.lowStockOnly
                    ? "bg-[#0d2e1a] border-accent-main/20 text-accent-main"
                    : "bg-bg-sidebar border-border-main text-[#444] hover:text-[#666]"
                )}
              >
                <span className="text-[10px] font-medium uppercase tracking-widest">Apenas Estoque Baixo</span>
                <div className={cn(
                  "w-8 h-4 rounded-full relative transition-colors",
                  filters.lowStockOnly ? "bg-accent-main" : "bg-[#1a1a1a]"
                )}>
                  <div className={cn(
                    "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                    filters.lowStockOnly ? "right-0.5" : "left-0.5"
                  )} />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
