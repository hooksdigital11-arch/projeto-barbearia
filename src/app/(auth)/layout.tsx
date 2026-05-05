import { ReactNode } from 'react'
import { BarberAnimation } from '@/features/auth/components/barber-animation'


/**
 * AuthLayout
 * Responsive 2-column layout for authentication pages.
 * Features a themed sidebar with animations on desktop.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-[#0a0a0a] to-background flex items-center justify-center p-4 lg:p-8 overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Lado Esquerdo: Animação Temática (Apenas Desktop) */}
          <div className="hidden lg:flex items-center justify-center min-h-[600px] border-r border-white/5 pr-12">
            <BarberAnimation />
          </div>

          {/* Lado Direito: Formulário Centralizado */}
          <div className="flex items-center justify-center w-full auth-card-container">
            <div className="w-full max-w-md p-8 lg:p-10 rounded-3xl border border-cyan-500/10 bg-card/30 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,229,255,0.1)] hover:shadow-[0_0_60px_-12px_rgba(0,229,255,0.15)] transition-all duration-500">
              <div className="relative z-10">
                {children}
              </div>
            </div>
          </div>
          
        </div>
      </div>


    </div>
  )
}
