import { ReactNode } from 'react'
import { ArrowUp, ArrowDown } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils/cn'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: number
  isPositive?: boolean
  icon?: ReactNode
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
      "bg-bg-surface border-[0.5px] border-border-main rounded-minimal p-[20px] px-[22px] flex flex-col justify-between min-h-[120px] group relative overflow-hidden",
      className
    )}>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between">
          <div className="text-[#444] group-hover:text-accent-main transition-colors">
            {icon}
          </div>
          
          {trend !== undefined && (
            <span className={cn(
              "text-[9px] font-medium px-2 py-1 rounded-sm border-[0.5px] tracking-wider uppercase",
              isPositive 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-red-500/10 text-red-400 border-red-500/20"
            )}>
              {isPositive ? '+' : ''}{trend}%
            </span>
          )}
        </div>

        <div className="space-y-1 mt-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#444] group-hover:text-text-secondary transition-colors">
            {title}
          </p>
          <h3 className="text-[28px] font-medium tracking-tight text-white tabular-nums">
            {value}
          </h3>
          {subtitle && (
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#333]">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
