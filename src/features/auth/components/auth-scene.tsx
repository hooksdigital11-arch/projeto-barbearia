'use client'

import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react'
import { DeskLamp } from './desk-lamp'

/**
 * AuthScene Component
 * Client wrapper that manages the desk lamp on/off state.
 * Controls the login card visibility, barbershop monster video, and background ambiance.
 * Desktop only: lamp toggles login form visibility and plays the monster video.
 * Mobile: always visible (no lamp, no video).
 */
export function AuthScene({ children }: { children: ReactNode }) {
  const [isLampOn, setIsLampOn] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const toggleLamp = useCallback(() => {
    setIsLampOn(prev => !prev)
  }, [])

  // Control video playback based on lamp state
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!isLampOn) {
      // Lamp OFF → play the monster video
      video.currentTime = 0
      video.play().catch(() => {
        // Autoplay may be blocked — silent fallback
      })
    } else {
      // Lamp ON → pause and reset
      video.pause()
      video.currentTime = 0
    }
  }, [isLampOn])

  return (
    <div className="relative flex items-center justify-center w-full min-h-screen">

      {/* === BACKGROUND AMBIANCE SHIFT === */}
      <div
        className="fixed inset-0 transition-all duration-700 ease-out pointer-events-none z-0"
        style={{
          backgroundColor: isLampOn ? 'transparent' : 'rgba(0,0,0,0.5)',
        }}
      />

      {/* === CIRCUIT LINES DIM OVERLAY (lamp off) === */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-700 ease-out z-[5]"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)',
          opacity: isLampOn ? 0 : 1,
        }}
      />

      {/* === BARBERSHOP MONSTER VIDEO — shows when lamp is OFF === */}
      <div
        className="fixed inset-0 z-[8] hidden lg:flex items-center justify-center pointer-events-none transition-all duration-700 ease-out"
        style={{
          opacity: isLampOn ? 0 : 1,
          transform: isLampOn ? 'scale(0.85)' : 'scale(1)',
        }}
      >
        <div className="relative w-full max-w-[300px] mx-auto">
          {/* Video container with vignette mask — 9:16 portrait */}
          <div
            className="relative rounded-3xl overflow-hidden max-h-[70vh]"
            style={{
              aspectRatio: '9 / 16',
              maskImage: 'radial-gradient(ellipse 90% 90% at center, black 40%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at center, black 40%, transparent 100%)',
            }}
          >
            <video
              ref={videoRef}
              src="/barbershop-monster.mp4"
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                filter: 'brightness(0.65) contrast(1.15) saturate(0.85)',
              }}
            />
          </div>

          {/* Ambient glow behind video */}
          <div
            className="absolute -inset-16 rounded-full pointer-events-none -z-10 transition-opacity duration-1000"
            style={{
              background: 'radial-gradient(circle, rgba(0,212,170,0.05) 0%, transparent 60%)',
              opacity: isLampOn ? 0 : 1,
            }}
          />

          {/* Subtle help text below video */}
          <p
            className="text-center text-[11px] text-white/30 font-medium mt-8 tracking-[0.15em] uppercase transition-opacity duration-700 delay-300"
            style={{ opacity: isLampOn ? 0 : 0.7 }}
          >
            Clique no abajur para acender a luz
          </p>
        </div>
      </div>

      {/* === LOGIN CARD — animated visibility === */}
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

      {/* === DESK LAMP — desktop only === */}
      <DeskLamp isOn={isLampOn} onToggle={toggleLamp} />

      {/* Lamp warm light wash when ON */}
      <div
        className="hidden lg:block fixed bottom-0 right-0 w-[500px] h-[400px] pointer-events-none transition-opacity duration-700 ease-out z-[1]"
        style={{
          background: 'radial-gradient(ellipse at bottom right, rgba(255,220,140,0.03) 0%, transparent 60%)',
          opacity: isLampOn ? 1 : 0,
        }}
      />
    </div>
  )
}
