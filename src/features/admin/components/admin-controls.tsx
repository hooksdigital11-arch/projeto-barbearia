'use client'

import { useState } from 'react'
import { DownloadSimple } from '@phosphor-icons/react'
import { SearchInput } from '@/components/shared/search-input'
import { cn } from '@/lib/utils/cn'

export function AdminControls() {
  const [activePeriod, setActivePeriod] = useState('Mês')

  return (
    <div className="space-y-6">
      {/* Header com Busca */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold font-syne text-white tracking-tight">
            Gestão da Unidade
          </h1>
          <p className="text-text-secondary">
            Acompanhe métricas, equipe e agendamentos em tempo real.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput 
            placeholder="Buscar barbeiro ou cliente..." 
            onSearch={(v) => console.log('Searching admin:', v)}
            className="w-full sm:w-64"
          />
          <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-text-secondary hover:text-white transition-all">
            <DownloadSimple size={24} weight="duotone" />
          </button>
          <button className="px-6 py-3 bg-accent-cyan text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent-cyan/20">
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros de Período */}
      <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl w-fit border border-white/5">
        {['Hoje', 'Semana', 'Mês', 'Custom'].map((period) => (
          <button 
            key={period}
            onClick={() => setActivePeriod(period)}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all",
              activePeriod === period 
                ? "bg-white text-black shadow-lg" 
                : "text-text-secondary hover:text-white hover:bg-white/5"
            )}
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  )
}
