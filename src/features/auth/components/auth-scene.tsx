'use client'

import { useState, useCallback, type ReactNode } from 'react'
import { DeskLamp } from './desk-lamp'

/**
 * AuthScene Component
 * Client wrapper that manages the desk lamp on/off state.
 * Controls the login card visibility and background ambiance.
 * Desktop only: lamp toggles login form visibility.
 * Mobile: always visible (no lamp).
 */
export function AuthScene({ children }: { children: ReactNode }) {
  const [isLampOn, setIsLampOn] = useState(true)

  const toggleLamp = useCallback(() => {
    setIsLampOn(prev => !prev)
  }, [])

  return (
    <>
      {/* Background ambiance shift */}
      <div
        className="absolute inset-0 transition-colors duration-700 ease-out pointer-events-none z-0"
        style={{
          backgroundColor: isLampOn ? 'transparent' : 'rgba(0,0,0,0.4)',
        }}
      />

      {/* Login card — animated visibility */}
      <div
        className="relative z-10 w-full max-w-[460px] mx-4 transition-all duration-700 ease-out"
        style={{
          opacity: isLampOn ? 1 : 0,
          transform: isLampOn
            ? 'scale(1) translateY(0px)'
            : 'scale(0.95) translateY(20px)',
          pointerEvents: isLampOn ? 'auto' : 'none',
          filter: isLampOn ? 'none' : 'blur(4px)',
        }}
      >
        {/* Glassmorphic Card */}
        <div className="relative rounded-2xl border border-white/[0.08] bg-[#0d0d0d]/90 backdrop-blur-2xl shadow-[0_32px_80px_-12px_rgba(0,0,0,0.9)] overflow-hidden">
          {/* Top glow line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-accent-main/40 to-transparent" />

          {/* Card content */}
          <div className="p-10 sm:p-12">
            {children}
          </div>
        </div>

        {/* External glow reflection */}
        <div className="absolute -inset-4 bg-gradient-to-b from-accent-main/5 to-transparent rounded-3xl blur-2xl pointer-events-none -z-10" />
      </div>

      {/* Circuit lines dim overlay when lamp is off */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700 ease-out z-[5]"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)',
          opacity: isLampOn ? 0 : 1,
        }}
      />

      {/* Desk Lamp — desktop only */}
      <DeskLamp isOn={isLampOn} onToggle={toggleLamp} />

      {/* Lamp light wash on the scene when ON */}
      <div
        className="hidden lg:block fixed bottom-0 right-0 w-[500px] h-[400px] pointer-events-none transition-opacity duration-700 ease-out z-[1]"
        style={{
          background: 'radial-gradient(ellipse at bottom right, rgba(255,220,140,0.03) 0%, transparent 60%)',
          opacity: isLampOn ? 1 : 0,
        }}
      />
    </>
  )
}
