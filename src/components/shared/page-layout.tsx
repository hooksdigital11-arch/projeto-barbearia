import { cn } from "@/lib/utils/cn"

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <main className={cn("flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full", className)}>
      {children}
    </main>
  )
}
