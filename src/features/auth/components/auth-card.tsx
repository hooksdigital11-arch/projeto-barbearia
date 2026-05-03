import { ReactNode } from 'react'

interface AuthCardProps {
  children: ReactNode
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md p-8 rounded-2xl border border-accent-cyan/20 bg-bg-secondary/40 backdrop-blur-xl shadow-2xl shadow-accent-cyan/10 hover:shadow-accent-cyan/20 transition-all duration-500">
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Subtle Background Glows */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-cyan/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent-emerald/10 blur-[100px] rounded-full pointer-events-none" />
    </div>
  )
}
