'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { DownloadSimple } from '@phosphor-icons/react'
import { SearchInput } from '@/components/shared/search-input'
import { cn } from '@/lib/utils/cn'

export function AdminControls() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activePeriod = searchParams.get('period') || 'month'

  const handlePeriodChange = (period: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', period)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('q', query)
    } else {
      params.delete('q')
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const periods = [
    { label: 'Hoje', value: 'today' },
    { label: 'Semana', value: 'week' },
    { label: 'Mês', value: 'month' },
    { label: 'Custom', value: 'custom' },
  ]

  return (
    <div className="space-y-8">
      {/* Header com Busca */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-10 bg-accent-cyan rounded-full shadow-[0_0_20px_rgba(0,229,255,0.6)]" />
            <h1 className="text-5xl font-black font-syne text-white tracking-tighter leading-none">
              Gestão da Unidade
            </h1>
          </div>
          <p className="text-text-secondary text-lg max-w-xl">
            Acompanhe métricas de performance, gestão de equipe e agendamentos em tempo real.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group/search">
            <SearchInput 
              placeholder="Buscar barbeiro ou cliente..." 
              onSearch={handleSearch}
              initialValue={searchParams.get('q') || ''}
              className="w-full sm:w-80 glass-input"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="tap-target glass rounded-2xl text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/30 transition-all active:scale-90 shadow-xl shadow-black/20">
              <DownloadSimple size={24} weight="bold" />
            </button>
            <button className="px-8 py-3.5 bg-accent-cyan text-black font-black text-sm uppercase tracking-widest rounded-2xl hover:scale-[1.03] active:scale-95 transition-all shadow-2xl shadow-cyan-500/30">
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filtros de Período */}
      <div className="glass p-1.5 rounded-[1.5rem] w-fit border border-white/5 shadow-2xl">
        <div className="flex items-center gap-1">
          {periods.map((period) => (
            <button 
              key={period.value}
              onClick={() => handlePeriodChange(period.value)}
              className={cn(
                "px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-95",
                activePeriod === period.value
                  ? "bg-white text-black shadow-[0_8px_15px_rgba(255,255,255,0.15)] scale-100" 
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              )}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
