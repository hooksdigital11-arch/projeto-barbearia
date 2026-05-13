import { ReactNode } from 'react'
import { AuthScene } from '@/features/auth/components/auth-scene'

/**
 * AuthLayout
 * Immersive full-screen centered layout with circuit-board background.
 * Features an interactive desk lamp (desktop) that toggles form visibility.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center overflow-hidden font-sans relative">

      {/* === CIRCUIT BOARD BACKGROUND === */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Circuit lines - Top Left */}
        <svg className="absolute top-0 left-0 w-[45%] h-[45%]" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 200 L80 200 L100 180 L170 180 L180 170 L250 170" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <path d="M200 0 L200 80 L180 100 L180 170" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <rect x="80" y="60" width="40" height="24" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <circle cx="75" cy="72" r="3" fill="rgba(255,255,255,0.15)" />
          <path d="M0 72 L72 72" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <path d="M120 72 L180 72 L180 100" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </svg>

        {/* Circuit lines - Top Right */}
        <svg className="absolute top-0 right-0 w-[45%] h-[45%]" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M400 200 L320 200 L300 180 L230 180 L220 170 L150 170" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <path d="M200 0 L200 80 L220 100 L220 170" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <rect x="280" y="60" width="40" height="24" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <circle cx="325" cy="72" r="3" fill="rgba(255,255,255,0.15)" />
          <path d="M400 72 L328 72" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <path d="M280 72 L220 72 L220 100" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </svg>

        {/* Circuit lines - Bottom Left */}
        <svg className="absolute bottom-0 left-0 w-[45%] h-[45%]" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 200 L80 200 L100 220 L170 220 L180 230 L250 230" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <path d="M200 400 L200 320 L180 300 L180 230" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <rect x="80" y="316" width="40" height="24" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <circle cx="75" cy="328" r="3" fill="rgba(255,255,255,0.15)" />
          <path d="M0 328 L72 328" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <path d="M120 328 L180 328 L180 300" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </svg>

        {/* Circuit lines - Bottom Right */}
        <svg className="absolute bottom-0 right-0 w-[45%] h-[45%]" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M400 200 L320 200 L300 220 L230 220 L220 230 L150 230" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <path d="M200 400 L200 320 L220 300 L220 230" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <rect x="280" y="316" width="40" height="24" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <circle cx="325" cy="328" r="3" fill="rgba(255,255,255,0.15)" />
          <path d="M400 328 L328 328" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <path d="M280 328 L220 328 L220 300" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </svg>

        {/* Center ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-main/5 blur-[200px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent-main/8 blur-[100px] rounded-full" />
      </div>

      {/* === INTERACTIVE SCENE (Client Component) === */}
      <AuthScene>
        {children}
      </AuthScene>

    </div>
  )
}
