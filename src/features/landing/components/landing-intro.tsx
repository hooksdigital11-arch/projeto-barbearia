'use client'

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { Scissors } from '@phosphor-icons/react'

export function LandingIntro() {
  const wrapperRef  = useRef<HTMLDivElement>(null)
  const contentRef  = useRef<HTMLDivElement>(null)
  const labelRef    = useRef<HTMLSpanElement>(null)
  const revealingRef = useRef(false)
  const [dismissed, setDismissed] = useState(false)

  // Lock scroll while intro is visible
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Entrance animation for the intro content
  useEffect(() => {
    if (!contentRef.current) return
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 })
        .from('[data-intro="icon"]',   { opacity: 0, scale: 0.6, duration: 0.7, ease: 'back.out(2)' })
        .from('[data-intro="brand"]',  { opacity: 0, y: 16, duration: 0.6 }, '-=0.3')
        .from('[data-intro="sub"]',    { opacity: 0, duration: 0.5 }, '-=0.3')
        .from('[data-intro="cta"]',    { opacity: 0, y: 10, duration: 0.5 }, '-=0.25')
    }, contentRef)
    return () => { ctx.revert() }
  }, [])

  // Breathing animation on the CTA label
  useEffect(() => {
    if (!labelRef.current) return
    const tween = gsap.to(labelRef.current, {
      opacity: 0.35,
      duration: 1.1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.2,
    })
    return () => { tween.kill() }
  }, [])

  const reveal = () => {
    if (revealingRef.current || !wrapperRef.current || !contentRef.current) return
    revealingRef.current = true

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = ''
        // Signal LandingAnimations that the page is now visible and ready
        document.dispatchEvent(new CustomEvent('landing:ready'))
        setDismissed(true)
      },
    })

    // 1. Content fades up and out
    tl.to(contentRef.current, {
      opacity: 0,
      y: -28,
      scale: 0.96,
      duration: 0.45,
      ease: 'power2.in',
    })

    // 2. Overlay sweeps up — the curved SVG at the bottom creates the wave reveal
    tl.to(wrapperRef.current, {
      y: -(window.innerHeight + 110),
      duration: 1.1,
      ease: 'power4.inOut',
    }, '-=0.1')
  }

  if (dismissed) return null

  return (
    <div
      ref={wrapperRef}
      onClick={reveal}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && reveal()}
      tabIndex={0}
      role="button"
      aria-label="Clique para começar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        // taller than viewport — the extra 110px is the wave SVG below
        height: 'calc(100vh + 110px)',
        zIndex: 9999,
        cursor: 'pointer',
        willChange: 'transform',
        outline: 'none',
      }}
    >
      {/* ── Main overlay ── */}
      <div
        style={{ position: 'absolute', inset: 0, height: '100vh', background: '#0a0a0a', overflow: 'hidden' }}
      >
        {/* Radial glow — mirrors the hero */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background:
              'radial-gradient(ellipse 100% 55% at 50% -5%, rgba(0,212,170,0.1) 0%, transparent 58%),' +
              'radial-gradient(ellipse 50% 50% at 85% 90%, rgba(0,212,170,0.04) 0%, transparent 55%)',
          }}
        />

        {/* Grain texture */}
        <div
          style={{
            position: 'absolute', inset: 0,
            opacity: 0.034,
            pointerEvents: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '175px 175px',
          }}
        />

        {/* Centered content */}
        <div
          ref={contentRef}
          data-intro="wrapper"
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '0',
          }}
        >
          {/* Scissors icon */}
          <div
            data-intro="icon"
            style={{ marginBottom: '28px' }}
          >
            <div
              style={{
                width: 72, height: 72,
                borderRadius: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,212,170,0.08)',
                border: '1px solid rgba(0,212,170,0.25)',
              }}
            >
              <Scissors size={32} color="#00d4aa" weight="bold" />
            </div>
          </div>

          {/* Brand */}
          <h1
            data-intro="brand"
            className="font-syne font-semibold uppercase text-white"
            style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', letterSpacing: '-0.03em', marginBottom: 8 }}
          >
            BarberOS
          </h1>

          {/* Subtitle */}
          <p
            data-intro="sub"
            className="font-mono uppercase text-white/30"
            style={{ fontSize: '10px', letterSpacing: '0.38em', marginBottom: 56 }}
          >
            Sistema de Gestão
          </p>

          {/* CTA */}
          <div data-intro="cta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            {/* Thinline horizontal rule */}
            <div style={{ width: 32, height: 1, background: 'rgba(0,212,170,0.3)' }} />

            <span
              ref={labelRef}
              className="font-mono uppercase text-white"
              style={{ fontSize: '10px', letterSpacing: '0.32em' }}
            >
              <span className="md:hidden">Toque para começar</span>
              <span className="hidden md:inline">Clique para começar</span>
            </span>

            {/* Animated down-arrow */}
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, opacity: 0.25 }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 6, height: 6,
                    borderRight: '1.5px solid #00d4aa',
                    borderBottom: '1.5px solid #00d4aa',
                    transform: 'rotate(45deg)',
                    animation: `introChevron 1.4s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Wave curve — extends below the overlay ──
          The concave top edge of this SVG creates the wave reveal effect
          as the overlay slides up out of view.
      ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 110,
          pointerEvents: 'none',
        }}
      >
        <svg
          viewBox="0 0 1440 110"
          preserveAspectRatio="none"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          {/* Concave arc: starts at (0,0), dips down to (720,110), returns to (1440,0)
              Fill covers everything below this arc → as overlay slides up the arc sweeps the screen */}
          <path d="M0 0 C360 110 1080 110 1440 0 L1440 110 L0 110 Z" fill="#0a0a0a" />
        </svg>
      </div>

      <style>{`
        @keyframes introChevron {
          0%,100% { opacity: 0.15; transform: rotate(45deg) translateY(0); }
          50%      { opacity: 0.7;  transform: rotate(45deg) translateY(4px); }
        }
      `}</style>
    </div>
  )
}
