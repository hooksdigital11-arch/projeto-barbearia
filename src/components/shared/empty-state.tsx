import { ReactNode } from 'react'
import { Ghost } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center space-y-6 rounded-3xl border border-dashed border-white/10 bg-white/[0.02]",
      className
    )}>
      <div className="p-6 rounded-full bg-white/5 text-text-secondary">
        {icon || <Ghost size={48} weight="duotone" />}
      </div>
      
      <div className="space-y-2 max-w-sm">
        <h3 className="text-xl font-bold text-white font-syne">{title}</h3>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>

      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  )
}
