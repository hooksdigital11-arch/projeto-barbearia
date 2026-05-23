'use client'

import { useState } from 'react'
import { Scissors, Clock, CheckCircle, MagnifyingGlass } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import type { Service } from '../types'
import Link from 'next/link'

interface ClientServicesPageProps {
  services: Service[]
}

export function ClientServicesPage({ services }: ClientServicesPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

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
    <div className="space-y-0 animate-in fade-in duration-700">
      {/* Header */}
      <div className="mb-[20px]">
        <h1 className="text-[32px] font-medium text-[#fff] tracking-[-0.02em] uppercase leading-none">
          Escolha seu Serviço
        </h1>
        <p className="text-[11px] text-[#333] mt-[5px] uppercase tracking-wider font-medium">
          Selecione o serviço desejado para agendar seu horário.
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-[10px] bg-[#0f0f0f] border border-[#1a1a1a] rounded-[8px] p-[11px_16px] mb-[18px]">
        <MagnifyingGlass size={14} className="text-[#2e2e2e]" weight="bold" />
        <input
          placeholder="Buscar serviço por nome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-[#888] text-[12px] w-full placeholder:text-[#2a2a2a] uppercase tracking-tight"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-[6px] mb-[24px] overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setCategoryFilter('')}
          className={cn(
            "p-[7px_18px] text-[10px] font-medium uppercase tracking-[0.08em] rounded-[20px] border transition-all shrink-0",
            !categoryFilter 
              ? "bg-[#1c1c1c] text-[#fff] border-[#2a2a2a]" 
              : "bg-[#0d0d0d] border-[#1e1e1e] text-[#444] hover:text-[#888]"
          )}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat!)}
            className={cn(
              "p-[7px_18px] text-[10px] font-medium uppercase tracking-[0.08em] rounded-[20px] border transition-all shrink-0",
              categoryFilter === cat
                ? "bg-[#1c1c1c] text-[#fff] border-[#2a2a2a]"
                : "bg-[#0d0d0d] border-[#1e1e1e] text-[#444] hover:text-[#888]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[10px]">
        {filtered.map(service => {
          const isSelected = selectedId === service.id
          const catKey = (service.category || 'outros').toUpperCase()
          const colors: Record<string, string> = {
            BARBA: '#d4aa00',
            COMBO: 'var(--accent)',
            CORTE: '#6b9fff',
            OUTROS: '#9b7cf6'
          }
          const bgColors: Record<string, string> = {
            BARBA: '#2e1a00',
            COMBO: 'color-mix(in srgb, var(--accent) 10%, transparent)',
            CORTE: '#0d1a2e',
            OUTROS: '#1a0d2e'
          }
          const color = colors[catKey] || colors.OUTROS
          const bgColor = bgColors[catKey] || bgColors.OUTROS

          return (
            <button
              key={service.id}
              onClick={() => setSelectedId(isSelected ? null : service.id)}
              className={cn(
                "bg-[#0f0f0f] border rounded-[10px] p-[18px_18px_16px] text-left relative overflow-hidden transition-all group flex flex-col justify-between",
                isSelected
                  ? "border-accent-main ring-1 ring-accent-main/20"
                  : "border-[#1a1a1a] hover:bg-[#111] hover:border-[#222]"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-[10px]">
                  <span 
                    className="text-[9px] font-medium uppercase tracking-[0.08em] p-[2px_0]"
                    style={{ color }}
                  >
                    {service.category || 'Outros'}
                  </span>
                  {isSelected && (
                    <CheckCircle size={14} weight="fill" className="text-accent-main" />
                  )}
                </div>

                <div className="flex items-start gap-[14px]">
                  <div
                    className="w-[44px] h-[44px] rounded-[10px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: bgColor }}
                  >
                    <Scissors size={18} weight="fill" className="text-[#fff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#fff] leading-tight uppercase tracking-tight truncate">{service.name}</p>
                    {service.description && (
                      <p className="text-[10px] text-[#2e2e2e] mt-[3px] leading-tight uppercase tracking-tight line-clamp-1">{service.description}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-[14px] pt-[12px] border-t border-[#141414]">
                <div className="flex items-center gap-[4px]">
                  <Clock size={12} className="text-[#2a2a2a]" weight="bold" />
                  <span className="text-[10px] text-[#444] uppercase tracking-wide">{service.duration_minutes}min</span>
                </div>
                <div className="flex items-baseline gap-[2px]">
                  <span className="text-[11px] text-[#555] font-medium uppercase">R$</span>
                  <span className="text-[17px] font-medium text-[#fff] tracking-tight">
                    {(service.price_cents / 100).toFixed(0)}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] p-32 text-center flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-[#141414] flex items-center justify-center text-[#2a2a2a]">
            <Scissors size={48} weight="thin" />
          </div>
          <p className="text-[14px] font-medium text-[#333] uppercase tracking-widest">Nenhum serviço encontrado</p>
        </div>
      )}

      {/* Floating CTA */}
      {selected && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="bg-[#0f0f0f] border border-accent-main/30 p-4 pr-5 rounded-[12px] flex items-center gap-6 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#333]">Selecionado</span>
              <span className="text-[13px] font-medium text-[#fff] uppercase truncate max-w-[200px]">{selected.name}</span>
              <span className="text-[11px] font-medium text-accent-main uppercase mt-0.5">R$ {(selected.price_cents / 100).toFixed(0)} • {selected.duration_minutes}min</span>
            </div>
            <Link 
              href={`/client/appointments?service=${selected.id}`}
              className="bg-[#fff] text-[#000] px-6 py-3 rounded-[8px] text-[11px] font-medium uppercase tracking-[0.08em] hover:bg-[#e8e8e8] transition-all"
            >
              Agendar Agora
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
