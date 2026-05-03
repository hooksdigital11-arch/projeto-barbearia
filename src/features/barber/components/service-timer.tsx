'use client'

import { useState, useEffect } from 'react'
import { Timer, Warning } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'

interface ServiceTimerProps {
  initialMinutes: number
  targetMinutes: number
}

export function ServiceTimer({ initialMinutes, targetMinutes }: ServiceTimerProps) {
  const [seconds, setSeconds] = useState(initialMinutes * 60)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const currentMinutes = Math.floor(seconds / 60)
  const displaySeconds = (seconds % 60).toString().padStart(2, '0')
  
  const isDelayed = currentMinutes >= targetMinutes
  const isCritical = currentMinutes >= targetMinutes + 10

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 rounded-2xl font-mono text-xl font-bold transition-all",
      isCritical ? "bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse" :
      isDelayed ? "bg-yellow-500/20 text-yellow-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]" :
      "bg-accent-cyan/10 text-accent-cyan"
    )}>
      {isCritical ? <Warning size={24} weight="bold" /> : <Timer size={24} weight="bold" />}
      <span>{currentMinutes}:{displaySeconds}</span>
      {isDelayed && <span className="text-[10px] uppercase ml-2 tracking-tighter">Atrasado</span>}
    </div>
  )
}
