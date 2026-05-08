import { cn } from "@/lib/utils/cn"

interface PageTitleProps {
  title: string
  subtitle?: string
  className?: string
}

export function PageTitle({ title, subtitle, className }: PageTitleProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-6">
        <div className="w-1.5 h-16 bg-accent-cyan" />
        <h1 className="text-6xl md:text-8xl font-black font-syne text-white tracking-[-0.04em] leading-[0.85] uppercase">
          {title}<span className="text-accent-cyan">.</span>
        </h1>
      </div>
      {subtitle && (
        <p className="text-text-secondary text-lg font-medium max-w-xl ml-[calc(1.5rem+1.5px)] border-l border-white/10 pl-8 leading-relaxed font-sans">
          {subtitle}
        </p>
      )}
    </div>
  )
}
