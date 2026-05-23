'use client'

import { useState, useEffect } from 'react'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import { CustomDateModal } from './custom-date-modal'
import type { ReportPeriod } from '../types'

interface PeriodSelectorProps {
  onPeriodChange: (start: string, end: string, period: ReportPeriod) => void
}

const periods: { label: string; value: ReportPeriod }[] = [
  { label: 'Hoje', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mês', value: 'month' },
  { label: 'Ano', value: 'year' },
]

export function PeriodSelector({ onPeriodChange }: PeriodSelectorProps) {
  const [activePeriod, setActivePeriod] = useState<ReportPeriod | 'custom'>('month')
  const [showCustom, setShowCustom] = useState(false)
  const [customRange, setCustomRange] = useState<{ start: string; end: string } | null>(null)
  const [compare, setCompare] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('reports-period') as ReportPeriod
    if (saved && periods.some(p => p.value === saved)) {
      handlePeriodSelect(saved)
    } else {
      handlePeriodSelect('month')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePeriodSelect = (period: ReportPeriod | 'custom') => {
    setActivePeriod(period)
    if (period !== 'custom') {
      setCustomRange(null)
      localStorage.setItem('reports-period', period)
    }
    
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    
    const start = new Date()
    start.setHours(0, 0, 0, 0)

    if (period === 'week') {
      start.setDate(end.getDate() - 7)
    } else if (period === 'month') {
      start.setMonth(end.getMonth() - 1)
    } else if (period === 'year') {
      start.setFullYear(end.getFullYear() - 1)
    }

    onPeriodChange(start.toISOString(), end.toISOString(), period)
  }

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 premium-card">
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePeriodSelect(p.value)}
              className={cn(
                "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                activePeriod === p.value 
                  ? "bg-accent-cyan text-black" 
                  : "text-text-muted hover:text-text-primary border border-white/10 hover:border-white/20"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={cn(
              "w-12 h-6 rounded-full p-1 transition-all border border-white/10",
              compare ? "bg-accent-cyan border-accent-cyan" : "bg-white/5"
            )}>
              <div className={cn(
                "w-4 h-4 rounded-full transition-all",
                compare ? "translate-x-6 bg-black" : "translate-x-0 bg-white/20"
              )} />
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={compare} 
              onChange={(e) => setCompare(e.target.checked)} 
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-text-primary transition-colors">
              Comparar
            </span>
          </label>

          {activePeriod === 'custom' && customRange ? (
            <div className="flex items-center gap-4 px-5 py-2.5 rounded-full bg-white/[0.03] border border-accent-cyan/30">
              <span className="text-[10px] font-bold text-accent-cyan tracking-widest font-mono uppercase">
                {new Date(customRange.start).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})} — {new Date(customRange.end).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
              </span>
              <button onClick={() => handlePeriodSelect('today')} className="text-accent-cyan hover:text-text-primary transition-colors">
                <X size={16} weight="bold" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowCustom(true)}
              className="flex items-center gap-3 px-6 py-2.5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              Personalizado
            </button>
          )}
        </div>
      </div>

      {showCustom && (
        <CustomDateModal
          onApply={(start, end) => {
            const startFull = `${start}T00:00:00.000Z`
            const endFull = `${end}T23:59:59.999Z`
            setCustomRange({ start: startFull, end: endFull })
            setActivePeriod('custom')
            setShowCustom(false)
            onPeriodChange(startFull, endFull, 'custom' as ReportPeriod)
          }}
          onClose={() => setShowCustom(false)}
        />
      )}
    </>
  )
}
