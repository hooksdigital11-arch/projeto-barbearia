import { cn } from "@/lib/utils/cn"

interface PageTitleProps {
  title: string
  subtitle?: string
  className?: string
}

export function PageTitle({ title, subtitle, className }: PageTitleProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-3">
        <h1 className="text-4xl md:text-5xl font-medium font-syne text-white tracking-[-0.02em] uppercase">
          {title}<span className="text-accent-main">.</span>
        </h1>
      </div>
      {subtitle && (
        <p className="text-text-secondary text-sm font-medium tracking-tight">
          {subtitle}
        </p>
      )}
    </div>
  )
}
