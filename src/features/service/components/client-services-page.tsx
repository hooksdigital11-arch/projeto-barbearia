'use client'

import { useState } from 'react'
import { Scissors, Clock, CheckCircle, MagnifyingGlass } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { CATEGORY_CONFIG } from '../types'
import type { Service, ServiceCategory } from '../types'
import Link from 'next/link'

interface ClientServicesPageProps {
  services: Service[]
}

export function ClientServicesPage({ services }: ClientServicesPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  const filtered = services.filter(s => {
    if (search) {
      const q = search.toLowerCase()
      if (!s.name.toLowerCase().includes(q) && !s.description?.toLowerCase().includes(q)) return false
    }
    if (categoryFilter && s.category !== categoryFilter) return false
    return true
  })

  const categories = Array.from(new Set(services.map(s => s.category).filter(Boolean)))
  const selected = services.find(s => s.id === selectedId)

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-accent-cyan rounded-full shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
          <h1 className="text-4xl font-black font-syne text-white tracking-tighter uppercase leading-none">
            Escolha seu <span className="text-accent-cyan">Serviço</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg font-medium">
          Selecione o serviço desejado para agendar seu horário.
        </p>
      </div>

      {/* Search */}
      <div className="relative group/search">
        <MagnifyingGlass size={20} weight="bold" className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within/search:text-accent-cyan transition-colors" />
        <input
          placeholder="Buscar serviço por nome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="glass-input w-full pl-14 h-14 text-base font-medium"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setCategoryFilter('')}
          className={cn(
            "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shrink-0",
            !categoryFilter ? "bg-white text-black shadow-lg" : "bg-white/5 text-text-secondary border border-white/5 hover:text-white"
          )}
        >
          Todos
        </button>
        {categories.map(cat => {
          const config = CATEGORY_CONFIG[cat as ServiceCategory]
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat!)}
              className={cn(
                "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shrink-0",
                categoryFilter === cat
                  ? "bg-white text-black shadow-lg"
                  : "bg-white/5 text-text-secondary border border-white/5 hover:text-white"
              )}
            >
              {config?.label || cat}
            </button>
          )
        })}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(service => {
          const isSelected = selectedId === service.id
          const config = CATEGORY_CONFIG[(service.category as ServiceCategory) || 'outros']
          return (
            <button
              key={service.id}
              onClick={() => setSelectedId(isSelected ? null : service.id)}
              className={cn(
                "glass-card p-8 text-left relative overflow-hidden transition-all duration-500 group active:scale-[0.98]",
                isSelected
                  ? "border-accent-cyan/50 shadow-[0_0_30px_rgba(0,229,255,0.15)] scale-[1.02]"
                  : "hover:border-white/20 hover:scale-[1.01]"
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 animate-in zoom-in-50 duration-300">
                  <div className="w-8 h-8 rounded-xl bg-accent-cyan flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <CheckCircle size={20} weight="fill" className="text-black" />
                  </div>
                </div>
              )}

              {/* Category accent line */}
              <div
                className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ backgroundColor: config.color }}
              />

              <div className="flex items-start gap-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundColor: `${config.color}15`, borderColor: `${config.color}30` }}
                >
                  <Scissors size={28} weight="duotone" style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border"
                      style={{ backgroundColor: `${config.color}10`, borderColor: `${config.color}20`, color: config.color }}
                    >
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-white mt-2 group-hover:text-accent-cyan transition-colors leading-tight">{service.name}</p>
                  {service.description && (
                    <p className="text-xs text-text-secondary mt-2 line-clamp-2 opacity-60">{service.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Clock size={16} weight="bold" />
                  <span className="text-sm font-bold">{service.duration_minutes} min</span>
                </div>
                <span className="text-2xl font-black text-accent-cyan font-mono tracking-tighter">
                  {formatPrice(service.price_cents)}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-32 text-center flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center text-text-secondary opacity-20">
            <Scissors size={48} weight="thin" />
          </div>
          <p className="text-xl font-bold font-syne text-white uppercase tracking-tight">Nenhum serviço encontrado</p>
          <p className="text-text-secondary">Tente outro termo de busca.</p>
        </div>
      )}

      {/* Floating CTA */}
      {selected && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="glass-card p-4 pr-5 flex items-center gap-5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] border-accent-cyan/20">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Selecionado</span>
              <span className="text-base font-bold text-white truncate max-w-[200px]">{selected.name}</span>
              <span className="text-sm font-mono text-accent-cyan font-bold">{formatPrice(selected.price_cents)} • {selected.duration_minutes}min</span>
            </div>
            <Button asChild variant="cyan" size="lg" className="shrink-0 shadow-cyan-500/30">
              <Link href={`/client/appointments?service=${selected.id}`}>
                Agendar Agora
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
