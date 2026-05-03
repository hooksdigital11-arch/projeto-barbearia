import { ReactNode } from 'react'
import { ArrowUp, ArrowDown } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils/cn'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: number
  isPositive?: boolean
  icon: ReactNode
  className?: string
}

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  isPositive,
  icon,
  className
}: KPICardProps) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border border-white/5 bg-card/20 backdrop-blur-xl space-y-4 transition-all hover:bg-card/30",
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{title}</span>
        <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan">
          {icon}
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
        
        {(trend !== undefined || subtitle) && (
          <div className="flex items-center gap-2">
            {trend !== undefined && (
              <span className={cn(
                "flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md",
                isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
              )}>
                {isPositive ? <ArrowUp size={12} weight="bold" /> : <ArrowDown size={12} weight="bold" />}
                {trend}%
              </span>
            )}
            {subtitle && <span className="text-xs text-text-secondary">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
