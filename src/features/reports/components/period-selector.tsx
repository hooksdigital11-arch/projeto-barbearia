'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils/cn'
import type { ReportPeriod } from '../types'

interface PeriodSelectorProps {
  onPeriodChange: (start: string, end: string, period: ReportPeriod) => void
}

export function PeriodSelector({ onPeriodChange }: PeriodSelectorProps) {
  const [activePeriod, setActivePeriod] = useState<ReportPeriod>('month')
  const [showCustom, setShowCustom] = useState(false)
  const [compare, setCompare] = useState(false)

  const periods: { label: string; value: ReportPeriod }[] = [
    { label: 'Hoje', value: 'today' },
    { label: 'Semana', value: 'week' },
    { label: 'Mês', value: 'month' },
    { label: 'Ano', value: 'year' },
  ]

  useEffect(() => {
    const saved = localStorage.getItem('reports-period') as ReportPeriod
    if (saved && periods.some(p => p.value === saved)) {
      handlePeriodSelect(saved)
    } else {
      handlePeriodSelect('month')
    }
  }, [])

  const handlePeriodSelect = (period: ReportPeriod) => {
    setActivePeriod(period)
    localStorage.setItem('reports-period', period)
    
    const end = new Date()
    let start = new Date()

    if (period === 'today') {
      start.setHours(0, 0, 0, 0)
    } else if (period === 'week') {
      start.setDate(end.getDate() - 7)
    } else if (period === 'month') {
      start.setMonth(end.getMonth() - 1)
    } else if (period === 'year') {
      start.setFullYear(end.getFullYear() - 1)
    }

    onPeriodChange(start.toISOString(), end.toISOString(), period)
  }

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl">
      <div className="flex p-1 bg-black/20 rounded-xl border border-white/5">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePeriodSelect(p.value)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
              activePeriod === p.value 
                ? "bg-accent-cyan text-black shadow-lg shadow-accent-cyan/20" 
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={cn(
            "w-10 h-5 rounded-full p-1 transition-all",
            compare ? "bg-accent-cyan" : "bg-white/10"
          )}>
            <div className={cn(
              "w-3 h-3 rounded-full bg-white transition-all",
              compare ? "translate-x-5" : "translate-x-0"
            )} />
          </div>
          <input 
            type="checkbox" 
            className="hidden" 
            checked={compare} 
            onChange={(e) => setCompare(e.target.checked)} 
          />
          <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
            Comparar com anterior
          </span>
        </label>

        <button 
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
        >
          <CalendarIcon size={16} weight="duotone" />
          Personalizado
        </button>
      </div>
    </div>
  )
}
