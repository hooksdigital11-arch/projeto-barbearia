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
      "glass-card p-8 space-y-6 group relative overflow-hidden",
      className
    )}>
      {/* Subtle background glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent-cyan/5 blur-3xl group-hover:bg-accent-cyan/10 transition-all duration-700" />
      
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary opacity-70 group-hover:opacity-100 transition-opacity">{title}</span>
        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-accent-cyan shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          {icon}
        </div>
      </div>
      
      <div className="space-y-3 relative z-10">
        <h3 className="text-4xl font-bold font-syne tracking-tight text-white group-hover:text-glow transition-all duration-500">{value}</h3>
        
        {(trend !== undefined || subtitle) && (
          <div className="flex items-center gap-3">
            {trend !== undefined && (
              <span className={cn(
                "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg border",
                isPositive 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
                  : "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
              )}>
                {isPositive ? <ArrowUp size={10} weight="bold" /> : <ArrowDown size={10} weight="bold" />}
                {trend}%
              </span>
            )}
            {subtitle && <span className="text-xs font-medium text-text-secondary opacity-60 italic">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
