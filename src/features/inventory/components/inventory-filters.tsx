'use client'

import { useState } from 'react'
import { MagnifyingGlass, Funnel, X } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
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
  inactiveCount: number
}

const TABS = [
  { value: 'all' as const, label: 'Todos' },
  { value: 'revenda' as const, label: 'Revenda' },
  { value: 'uso_interno' as const, label: 'Uso Interno' },
  { value: 'inactive' as const, label: 'Inativos' },
]

const CATEGORIES = ['pomada', 'shampoo', 'lamina', 'tesoura', 'oleo', 'creme', 'outros']

export function InventoryFilters({
  activeTab, setActiveTab, search, setSearch, filters, setFilters, inactiveCount
}: InventoryFiltersProps) {
  const [showPanel, setShowPanel] = useState(false)
  
  const hasActiveFilters = filters.category || filters.minQty || filters.maxQty || filters.lowStockOnly

  const resetFilters = () => setFilters({ category: '', minQty: '', maxQty: '', lowStockOnly: false })

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Abas */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-full md:w-auto">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex-1 md:flex-none px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 justify-center",
                activeTab === tab.value
                  ? tab.value === 'inactive' ? "bg-red-500/20 text-red-400" : "bg-accent-cyan text-black"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              {tab.label}
              {tab.value === 'inactive' && inactiveCount > 0 && (
                <span className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                  activeTab === 'inactive' ? "bg-red-400/30 text-red-300" : "bg-red-500/20 text-red-400"
                )}>{inactiveCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search + Filter button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto, categoria ou fornecedor..."
              className="pl-10 bg-black/40 border-white/10 rounded-2xl focus:border-accent-cyan transition-all"
            />
          </div>
          <button
            onClick={() => setShowPanel(!showPanel)}
            className={cn(
              "p-3 border rounded-2xl transition-all relative",
              showPanel || hasActiveFilters
                ? "bg-accent-cyan/10 border-accent-cyan/50 text-accent-cyan"
                : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
            )}
          >
            <Funnel size={20} weight={hasActiveFilters ? "fill" : "regular"} />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-cyan rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Painel de Filtros */}
      {showPanel && (
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Filtros Avançados</h3>
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 font-bold"
                >
                  <X size={12} weight="bold" />
                  Limpar filtros
                </button>
              )}
              <button onClick={() => setShowPanel(false)} className="text-muted-foreground hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Categoria */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Categoria</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilters({ ...filters, category: filters.category === cat ? '' : cat })}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all",
                      filters.category === cat
                        ? "bg-accent-cyan/10 border-accent-cyan/50 text-accent-cyan"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantidade */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Quantidade em Estoque</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={filters.minQty}
                    onChange={(e) => setFilters({ ...filters, minQty: e.target.value })}
                    className="bg-white/5 border-white/10 rounded-xl text-sm"
                  />
                </div>
                <span className="text-muted-foreground text-sm">—</span>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={filters.maxQty}
                    onChange={(e) => setFilters({ ...filters, maxQty: e.target.value })}
                    className="bg-white/5 border-white/10 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Estoque Baixo */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Status de Estoque</label>
              <button
                onClick={() => setFilters({ ...filters, lowStockOnly: !filters.lowStockOnly })}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                  filters.lowStockOnly
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
                )}
              >
                <span className="text-xs font-bold uppercase tracking-widest">Apenas Estoque Baixo</span>
                <div className={cn(
                  "w-8 h-4 rounded-full relative transition-colors",
                  filters.lowStockOnly ? "bg-amber-500" : "bg-white/10"
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
