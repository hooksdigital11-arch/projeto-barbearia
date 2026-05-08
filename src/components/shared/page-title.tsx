import { cn } from "@/lib/utils/cn"

interface PageTitleProps {
  title: string
  subtitle?: string
  className?: string
}

export function PageTitle({ title, subtitle, className }: PageTitleProps) {
  return (
    <div className={cn("space-y-4 mb-20", className)}>
      <div className="space-y-1">
        {subtitle && (
          <p className="label-muted opacity-40">
            {subtitle}
          </p>
        )}
        <h1 className="heading-hero text-4xl md:text-5xl lg:text-6xl">
          {title}<span className="text-accent-cyan">.</span>
        </h1>
      </div>
      <div className="h-[2px] w-12 bg-accent-cyan opacity-30" />
    </div>
  )
}
