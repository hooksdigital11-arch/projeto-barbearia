'use client'

import { useState, useEffect } from 'react'
import { CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface CustomDateModalProps {
  onApply: (start: string, end: string) => void
  onClose: () => void
}

export function CustomDateModal({ onApply, onClose }: CustomDateModalProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [daysCount, setDaysCount] = useState<number>(0)

  useEffect(() => {
    validate()
  }, [startDate, endDate])

  const validate = () => {
    setError(null)
    setDaysCount(0)

    if (!startDate || !endDate) return

    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    // Normalize to compare dates only
    const startCompare = new Date(startDate)
    const endCompare = new Date(endDate)

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

    setDaysCount(diffDays + 1)
  }

  const applyShortcut = (days: number, currentYear: boolean = false) => {
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
  }

  const handleApply = () => {
    if (error || !startDate || !endDate) return
    onApply(startDate, endDate)
  }

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '---'
    const parts = dateStr.split('-')
    const year = parts[0] ?? ''
    const month = parts[1] ?? '1'
    const day = parts[2] ?? ''
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    const monthIdx = parseInt(month) - 1
    return `${day} ${months[monthIdx] ?? '---'} ${year}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[420px] bg-[#111111] border border-[#222222] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-cyan/10 text-accent-cyan">
              <CalendarIcon size={20} />
            </div>
            <h3 className="text-lg font-bold font-syne tracking-tight text-white">
              Período personalizado
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Shortcuts */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => applyShortcut(6)} className="px-3 py-1.5 text-xs font-medium bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-lg transition-colors">
              Últimos 7 dias
            </button>
            <button onClick={() => applyShortcut(29)} className="px-3 py-1.5 text-xs font-medium bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-lg transition-colors">
              Últimos 30 dias
            </button>
            <button onClick={() => applyShortcut(89)} className="px-3 py-1.5 text-xs font-medium bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-lg transition-colors">
              Últimos 90 dias
            </button>
            <button onClick={() => applyShortcut(0, true)} className="px-3 py-1.5 text-xs font-medium bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-lg transition-colors">
              Este ano
            </button>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <CalendarIcon size={12} />
                Data inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl text-white px-4 py-3 cursor-pointer focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <CalendarIcon size={12} />
                Data final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl text-white px-4 py-3 cursor-pointer focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-all"
              />
            </div>
          </div>

          {/* Validation Feedback */}
          {error && (
            <div className={cn("p-3 rounded-xl text-sm font-medium",
              error.includes('Máximo') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            )}>
              {error}
            </div>
          )}

          {/* Preview */}
          {!error && startDate && endDate && (
            <div className="p-4 rounded-xl bg-accent-cyan/5 border border-accent-cyan/10">
              <p className="text-sm text-gray-300 text-center">
                <span className="font-bold text-white">{formatDateLabel(startDate)}</span>
                <span className="mx-2 text-accent-cyan">→</span>
                <span className="font-bold text-white">{formatDateLabel(endDate)}</span>
              </p>
              <p className="text-xs text-center text-accent-cyan mt-1 font-medium">
                ({daysCount} {daysCount === 1 ? 'dia' : 'dias'})
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#222222] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 text-white hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={!!error || !startDate || !endDate}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-accent-cyan text-black hover:bg-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}
