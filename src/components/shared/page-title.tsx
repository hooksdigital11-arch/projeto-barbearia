import { cn } from "@/lib/utils/cn"

interface PageTitleProps {
  title: string
  subtitle?: string
  className?: string
}

export function PageTitle({ title, subtitle, className }: PageTitleProps) {
  return (
    <div className={cn("space-y-1 mb-8", className)}>
      <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg text-text-secondary">
          {subtitle}
        </p>
      )}
    </div>
  )
}
