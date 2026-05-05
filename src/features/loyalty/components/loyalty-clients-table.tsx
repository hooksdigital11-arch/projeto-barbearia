'use client'

import { useState, useTransition } from 'react'
import { Plus, Minus, MagnifyingGlass, Funnel } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
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
      if (result.success) toast.success('Carimbo adicionado!')
      else toast.error(result.error || 'Erro')
    })
  }

  const handleRemove = (clientId: string) => {
    startTransition(async () => {
      const result = await removeStamp(clientId)
      if (result.success) toast.success('Carimbo removido')
      else toast.error(result.error || 'Erro')
    })
  }

  const FILTERS: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'ready', label: '🎉 Prontos' },
    { value: 'in_progress', label: 'Em Progresso' },
  ]

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-full md:w-auto">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "flex-1 md:flex-none px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                filter === f.value
                  ? f.value === 'ready' ? "bg-green-500/20 text-green-400" : "bg-accent-cyan text-black"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 md:w-72 md:flex-none">
          <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="pl-10 bg-black/40 border-white/10 rounded-2xl"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-white font-bold">Nenhum cliente encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Ajuste os filtros ou busca.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">
                    {config.mode === 'stamps' ? 'Carimbos' : 'Pontos'}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Progresso</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(client => {
                  const initials = client.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  return (
                    <tr
                      key={client.id}
                      className={cn(
                        "transition-all",
                        client.ready ? "bg-green-500/[0.03] hover:bg-green-500/[0.06]" : "hover:bg-white/[0.03]"
                      )}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan font-bold text-xs flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">{client.full_name}</p>
                            {client.phone && <p className="text-[10px] text-muted-foreground">{client.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={cn("text-sm font-bold", client.ready ? "text-green-400" : "text-white")}>
                          {client.balance}/{client.goal}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="w-full max-w-[160px]">
                          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                client.ready ? "bg-green-500" : "bg-accent-cyan"
                              )}
                              style={{ width: `${client.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={cn(
                          "text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest",
                          client.ready
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20"
                        )}>
                          {client.ready ? '🎉 Pronto!' : 'Ativo'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            disabled={isPending}
                            onClick={() => handleAdd(client.id)}
                            className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-50"
                            title="Adicionar carimbo"
                          >
                            <Plus size={16} weight="bold" />
                          </button>
                          <button
                            disabled={isPending || client.balance <= 0}
                            onClick={() => handleRemove(client.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-30"
                            title="Remover carimbo"
                          >
                            <Minus size={16} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
