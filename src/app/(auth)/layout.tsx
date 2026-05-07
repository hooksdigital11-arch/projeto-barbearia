import { ReactNode } from 'react'
import { BarberAnimation } from '@/features/auth/components/barber-animation'


/**
 * AuthLayout
 * Responsive 2-column layout for authentication pages.
 * Features a themed sidebar with animations on desktop.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center p-6 lg:p-12 overflow-hidden font-sans relative">

      {/* Immersive Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent-cyan/10 blur-[150px] rounded-full animate-float" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-blue/5 blur-[150px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.03)_0%,transparent_70%)]" />
      </div>

      <div className="w-full max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">

          {/* Left Column: Branding & Animation */}
          <div className="hidden lg:flex flex-col items-start justify-center min-h-[600px] border-r border-white/5 pr-16 space-y-10">
            <div className="space-y-4 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="flex items-center gap-3">
                <div className="w-3 h-12 bg-accent-cyan rounded-full shadow-[0_0_20px_rgba(0,229,255,0.6)]" />
                <h1 className="text-6xl font-black font-syne text-white tracking-tighter leading-none">
                  Barber<span className="text-accent-cyan">Pro</span>
                </h1>
              </div>
              <p className="text-xl text-text-secondary font-medium max-w-sm leading-relaxed">
                A plataforma definitiva para barbearias de alto padrão.
              </p>
            </div>
            <div className="w-full max-w-md animate-in zoom-in-95 duration-1000 delay-300">
              <BarberAnimation />
            </div>
          </div>

          {/* Right Column: Auth Container */}
          <div className="flex items-center justify-center w-full animate-in fade-in slide-in-from-right-8 duration-700 delay-200 form-container">
            <div className="w-full max-w-lg glass-card p-12 lg:p-16 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] border-white/20 relative group">
              <div className="absolute -inset-px bg-gradient-to-br from-accent-cyan/20 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
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
