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
      "premium-card p-10 flex flex-col justify-between min-h-[180px] group relative overflow-hidden",
      className
    )}>
      {/* Background Icon Detail */}
      {icon && (
        <div className="absolute -right-4 -top-4 text-white/[0.02] group-hover:text-accent-cyan/[0.04] transition-all duration-700 scale-[2.5]">
          {icon}
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-text-muted group-hover:text-accent-cyan group-hover:border-accent-cyan/30 transition-all duration-500">
            {icon || <div className="w-5 h-5 bg-white/10 rounded-full" />}
          </div>
          
          {trend !== undefined && (
            <span className={cn(
              "text-[9px] font-black px-3 py-1.5 rounded-full border tracking-widest uppercase",
              isPositive 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
                : "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
            )}>
              {isPositive ? '+' : ''}{trend}%
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted group-hover:text-text-secondary transition-colors">
              {title}
            </p>
            <h3 className="text-4xl font-black font-mono tracking-tighter text-white tabular-nums">
              {value}
            </h3>
          </div>
          
          {subtitle && (
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
