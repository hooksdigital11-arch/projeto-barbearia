'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'

interface QueueTimerProps {
  expiresAt: string
  onExpire?: () => void
  size?: 'sm' | 'lg'
}

export function QueueTimer({ expiresAt, onExpire, size = 'sm' }: QueueTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [totalTime] = useState<number>(15 * 60) // 15 minutes in seconds

  const calcTimeLeft = useCallback(() => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    return Math.max(0, Math.floor(diff / 1000))
  }, [expiresAt])

  useEffect(() => {
    setTimeLeft(calcTimeLeft())

    const interval = setInterval(() => {
      const remaining = calcTimeLeft()
      setTimeLeft(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
        onExpire?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [calcTimeLeft, onExpire])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = (timeLeft / totalTime) * 100

  const colorClass =
    timeLeft > 10 * 60
      ? 'text-emerald-400'
      : timeLeft > 5 * 60
        ? 'text-yellow-400'
        : 'text-red-400'

  const barColorClass =
    timeLeft > 10 * 60
      ? 'bg-emerald-400'
      : timeLeft > 5 * 60
        ? 'bg-yellow-400'
        : 'bg-red-400'

  const isUrgent = timeLeft <= 5 * 60

  if (size === 'lg') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2">
          <span className={cn('font-mono text-3xl font-bold tabular-nums', colorClass, isUrgent && 'animate-pulse')}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-sm text-text-secondary">restantes</span>
        </div>
        <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-1000 ease-linear', barColorClass)}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-secondary">⏱️</span>
      <span className={cn('font-mono text-sm font-bold tabular-nums', colorClass, isUrgent && 'animate-pulse')}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      <span className="text-xs text-text-secondary">restantes</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden min-w-[60px]">
        <div
          className={cn('h-full rounded-full transition-all duration-1000 ease-linear', barColorClass)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
