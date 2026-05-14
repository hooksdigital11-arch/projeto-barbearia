'use client'

import { useState, useTransition } from 'react'
import { Plus, Minus, MagnifyingGlass, Funnel } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import { addStamp, removeStamp } from '../actions'
import { toast } from 'sonner'
import type { ClientLoyalty, LoyaltyConfig } from '../types'

type FilterType = 'all' | 'ready' | 'in_progress'

interface LoyaltyClientsTableProps {
  clients: ClientLoyalty[]
  config: LoyaltyConfig
}

export function LoyaltyClientsTable({ clients, config }: LoyaltyClientsTableProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [isPending, startTransition] = useTransition()

  const unit = config.mode === 'stamps' ? 'carimbo' : 'pt'

  const filtered = clients.filter(c => {
    const matchesSearch = !search || c.full_name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'all' ||
      (filter === 'ready' && c.ready) ||
      (filter === 'in_progress' && !c.ready && c.balance > 0)
    return matchesSearch && matchesFilter
  })

  const handleAdd = (clientId: string) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.set('amount', '1')
      formData.set('notes', 'Carimbo manual')
      const result = await addStamp(clientId, formData)
      if (result.success) toast.success('CARIMBO ADICIONADO!')
      else toast.error(result.error || 'ERRO')
    })
  }

  const handleRemove = (clientId: string) => {
    startTransition(async () => {
      const result = await removeStamp(clientId)
      if (result.success) toast.success('CARIMBO REMOVIDO')
      else toast.error(result.error || 'ERRO')
    })
  }

  const FILTERS: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'TODOS' },
    { value: 'ready', label: 'PRONTOS' },
    { value: 'in_progress', label: 'EM PROGRESSO' },
  ]

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex p-[3px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] w-full md:w-auto">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "flex-1 md:flex-none px-6 py-2 rounded-[6px] text-[10px] font-medium uppercase tracking-[0.05em] transition-all duration-300",
                filter === f.value
                  ? "bg-[#1c1c1c] text-text-secondary"
                  : "text-[#333] hover:text-text-nav"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative group bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] flex items-center px-[14px] w-full md:w-[240px]">
          <MagnifyingGlass size={14} className="text-[#2e2e2e] shrink-0" />
          <input
            type="text"
            placeholder="BUSCAR CLIENTE..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none py-[9px] pl-[10px] text-[11px] text-text-secondary placeholder:text-[#2e2e2e] w-full font-medium"
          />
        </div>
      </div>

      {/* List Container */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[10px] p-[48px] px-[24px] text-center">
            <h3 className="text-[13px] font-medium text-[#333] uppercase tracking-tight mb-2">Nenhum cliente encontrado</h3>
            <p className="text-[10px] text-[#222] font-medium uppercase">Ajuste os filtros ou a busca.</p>
          </div>
        ) : (
          <div className="space-y-[4px]">
            {filtered.map(client => {
              const initials = client.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              const actions = (
                <div className="flex items-center gap-2">
                  <button
                    disabled={isPending}
                    onClick={() => handleAdd(client.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-bg-surface border-[0.5px] border-border-main text-accent-main opacity-40 hover:opacity-100 transition-all disabled:opacity-20"
                  >
                    <Plus size={14} weight="bold" />
                  </button>
                  <button
                    disabled={isPending || client.balance <= 0}
                    onClick={() => handleRemove(client.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-bg-surface border-[0.5px] border-border-main text-red-500/50 hover:text-red-500/80 hover:opacity-100 transition-all disabled:opacity-10"
                  >
                    <Minus size={14} weight="bold" />
                  </button>
                </div>
              )
              return (
                <div
                  key={client.id}
                  className={cn(
                    "bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] group hover:bg-bg-surface transition-all",
                    client.ready && "border-accent-main/20"
                  )}
                >
                  {/* Mobile card */}
                  <div className="md:hidden p-[14px] flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-[6px] bg-bg-surface border-[0.5px] border-border-main flex items-center justify-center text-text-nav font-medium text-[10px] shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-medium text-text-secondary uppercase tracking-tight truncate">{client.full_name}</p>
                          {client.phone && <p className="text-[9px] text-[#333] font-medium">{client.phone}</p>}
                        </div>
                      </div>
                      {actions}
                    </div>
                    <div className="flex items-center gap-3 pl-[44px]">
                      <div className="flex-1 h-[4px] bg-bg-sidebar rounded-full overflow-hidden border-[0.5px] border-border-main">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", client.ready ? "bg-accent-main" : "bg-[#333]")}
                          style={{ width: `${client.progress}%` }}
                        />
                      </div>
                      <span className={cn("text-[10px] font-medium tracking-widest shrink-0", client.ready ? "text-accent-main" : "text-[#333]")}>
                        {client.balance}/{client.goal}
                      </span>
                    </div>
                  </div>

                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-[1fr_120px_100px_90px] gap-4 items-center py-[14px] px-[18px]">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-[6px] bg-bg-surface border-[0.5px] border-border-main flex items-center justify-center text-text-nav font-medium text-[10px] shrink-0">
                        {initials}
                      </div>
                      <div className="truncate">
                        <p className="text-[12px] font-medium text-text-secondary uppercase tracking-tight truncate">{client.full_name}</p>
                        {client.phone && <p className="text-[9px] text-[#333] font-medium">{client.phone}</p>}
                      </div>
                    </div>

                    <div className="px-2">
                      <div className="h-[4px] bg-bg-sidebar rounded-full overflow-hidden border-[0.5px] border-border-main">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", client.ready ? "bg-accent-main" : "bg-[#333]")}
                          style={{ width: `${client.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      <span className={cn("text-[10px] font-medium tracking-widest", client.ready ? "text-accent-main" : "text-[#333]")}>
                        {client.balance}/{client.goal}
                      </span>
                    </div>

                    <div className="flex justify-end">{actions}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
