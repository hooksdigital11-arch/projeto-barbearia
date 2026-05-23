'use client'

import { useState, useEffect } from 'react'
import { CalendarBlank, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'

interface CustomDateModalProps {
  onApply: (start: string, end: string) => void
  onClose: () => void
}

export function CustomDateModal({ onApply, onClose }: CustomDateModalProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    validate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate])

  const validate = () => {
    setError(null)

    if (!startDate || !endDate) return

    const startCompare = new Date(startDate)
    const endCompare = new Date(endDate)
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    // Add timezone offset to avoid previous day selection issue
    startCompare.setMinutes(startCompare.getMinutes() + startCompare.getTimezoneOffset())
    endCompare.setMinutes(endCompare.getMinutes() + endCompare.getTimezoneOffset())

    if (endCompare < startCompare) {
      setError('Data final deve ser após a data inicial')
      return
    }

    if (startCompare > today || endCompare > today) {
      setError('Não é possível selecionar datas futuras')
      return
    }

    const diffTime = Math.abs(endCompare.getTime() - startCompare.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 365) {
      setError('Máximo de 365 dias por consulta')
      return
    }
  }

  const applyShortcut = (label: string, days: number, currentYear: boolean = false) => {
    const today = new Date()
    const endStr = today.toISOString().split('T')[0] ?? ''

    let startStr = ''
    if (currentYear) {
      const yearStart = new Date(today.getFullYear(), 0, 1)
      startStr = yearStart.toISOString().split('T')[0] ?? ''
    } else {
      const start = new Date(today)
      start.setDate(start.getDate() - days)
      startStr = start.toISOString().split('T')[0] ?? ''
    }

    setStartDate(startStr)
    setEndDate(endStr)
    setActiveId(label)
  }

  const handleApply = () => {
    if (error || !startDate || !endDate) return
    onApply(startDate, endDate)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[380px] bg-bg-black border border-border-main rounded-[12px] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-main/50">
          <div className="flex items-center gap-2.5">
            <CalendarBlank size={16} weight="bold" className="text-accent-main" />
            <h3 className="text-[14px] font-medium text-text-primary tracking-tight">Período personalizado</h3>
          </div>
          <button
            onClick={onClose}
            className="w-[26px] h-[26px] flex items-center justify-center rounded-full text-[#444] hover:text-text-primary hover:bg-white/5 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Shortcuts */}
          <div className="flex flex-wrap gap-[7px]">
            {[
              { label: 'ÚLTIMOS 7 DIAS', days: 6 },
              { label: 'ÚLTIMOS 30 DIAS', days: 29 },
              { label: 'ÚLTIMOS 90 DIAS', days: 89 },
              { label: 'ESTE ANO', currentYear: true }
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => applyShortcut(s.label, s.days || 0, s.currentYear)}
                className={cn(
                  "px-[14px] py-[6px] rounded-[6px] border-[0.5px] text-[10px] font-medium tracking-[0.07em] transition-all uppercase",
                  activeId === s.label
                    ? "bg-[#0d2e29] border-accent-main/20 text-accent-main"
                    : "bg-bg-sidebar border-border-main text-text-nav hover:border-[#2a2a2a] hover:text-text-muted"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-[12px]">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <CalendarBlank size={12} className="text-[#2e2e2e]" />
                <label className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Data Inicial</label>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setActiveId(null)
                }}
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] text-text-secondary text-[12px] p-[10px_12px] focus:outline-none focus:border-accent-main/20 [color-scheme:dark] transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <CalendarBlank size={12} className="text-[#2e2e2e]" />
                <label className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Data Final</label>
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setActiveId(null)
                }}
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] text-text-secondary text-[12px] p-[10px_12px] focus:outline-none focus:border-accent-main/20 [color-scheme:dark] transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-[7px] bg-[#ef44440a] border border-[#ef444422] text-[10px] text-[#ef4444] uppercase tracking-wider text-center">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t-[0.5px] border-border-main grid grid-cols-2 gap-[10px]">
          <button
            onClick={onClose}
            className="py-[11px] rounded-[7px] bg-bg-sidebar border-[0.5px] border-border-main text-[10px] font-medium text-[#444] uppercase tracking-wider hover:bg-bg-surface transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={!!error || !startDate || !endDate}
            className="py-[11px] rounded-[7px] bg-accent-main text-black text-[10px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}
