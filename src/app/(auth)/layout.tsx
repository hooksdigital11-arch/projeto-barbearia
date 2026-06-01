import { ReactNode } from 'react'
import Link from 'next/link'
import { Scissors } from '@phosphor-icons/react/dist/ssr'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">

      {/* ═══ LEFT PANEL ═══ */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[40%] flex-col relative overflow-hidden">

        {/* Atmospheric glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 120% 55% at 50% -8%, rgba(0,212,170,0.09) 0%, transparent 58%),' +
              'radial-gradient(ellipse 70% 60% at -5% 95%, rgba(0,212,170,0.04) 0%, transparent 55%),' +
              '#0a0a0a',
          }}
        />

        {/* Grain */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.033,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '175px 175px',
          }}
        />

        {/* Right border */}
        <div className="absolute right-0 inset-y-0 w-px bg-white/[0.05]" />

        {/* Content */}
        <div className="relative flex flex-col h-full px-12 py-11">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-[7px] group w-fit">
            <Scissors size={14} className="text-accent-main" weight="fill" />
            <span className="font-syne text-[12px] font-semibold uppercase tracking-[0.22em] text-white group-hover:text-white/70 transition-colors duration-300">
              BarberOS
            </span>
          </Link>

          {/* Headline */}
          <div className="flex-1 flex items-center">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.42em] text-accent-main mb-6">
                Acesso ao painel
              </p>
              <h1 className="font-syne uppercase select-none">
                <span
                  className="block font-medium leading-none"
                  style={{
                    fontSize: 'clamp(3rem, 5vw, 6rem)',
                    color: 'rgba(255,255,255,0.09)',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                  }}
                >
                  Acesso.
                </span>
                <span
                  className="block font-medium leading-none"
                  style={{
                    fontSize: 'clamp(3rem, 5vw, 6rem)',
                    color: '#ffffff',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    marginTop: '-0.09em',
                  }}
                >
                  Seguro.
                </span>
              </h1>
              <p className="mt-8 font-mono text-[10px] text-white/22 uppercase tracking-[0.26em] leading-[2.1] max-w-[220px]">
                Gerencie sua barbearia com precisão e controle total.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="font-mono text-[9px] text-white/12 uppercase tracking-wider">
            © {new Date().getFullYear()} BarberOS
          </p>
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">

        {/* Mobile brand */}
        <div className="lg:hidden flex items-center gap-[7px] px-6 pt-8">
          <Scissors size={14} className="text-accent-main" weight="fill" />
          <Link href="/" className="font-syne text-[12px] font-semibold uppercase tracking-[0.22em] text-white">
            BarberOS
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[380px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
