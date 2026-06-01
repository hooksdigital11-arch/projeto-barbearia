'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const ITEMS = [
  'AGENDAMENTO 24H',
  'SEM MENSALIDADE',
  'WHATSAPP AUTOMÁTICO',
  'COMANDA DIGITAL',
  'ZERO NO-SHOW',
  'FIDELIDADE DIGITAL',
  'SUPORTE INCLUSO',
  'SEUS DADOS',
  'IMPLEMENTAÇÃO EM 48H',
]

function TickerRow({ reverse = false }: { reverse?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    let tween: gsap.core.Tween | null = null

    // Wait one frame so the browser has painted and scrollWidth is accurate
    const raf = requestAnimationFrame(() => {
      const half = el.scrollWidth / 2
      if (half <= 0) return

      // Both rows have content duplicated (ITEMS × 2).
      // Forward:  animate x from 0 to -half. On repeat, x resets to 0 — seamless
      //           because position 0 (first copy) looks identical to position -half (second copy).
      // Reverse:  animate x from -half to 0. Same seamless property.
      tween = reverse
        ? gsap.fromTo(el, { x: -half }, { x: 0, ease: 'none', duration: 26, repeat: -1 })
        : gsap.fromTo(el, { x: 0 }, { x: -half, ease: 'none', duration: 26, repeat: -1 })
    })

    return () => {
      cancelAnimationFrame(raf)
      tween?.kill()
    }
  }, [reverse])

  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div className="overflow-hidden w-full">
      <div
        ref={trackRef}
        className="flex items-center whitespace-nowrap"
        style={{ willChange: 'transform' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span
              className="font-syne text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.28em] px-7 py-[14px]"
              style={{ color: i % 3 === 0 ? '#00d4aa' : 'rgba(255,255,255,0.18)' }}
            >
              {item}
            </span>
            <span className="text-white/10 text-[8px]">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function LandingTicker() {
  return (
    <div className="border-y border-white/[0.05] overflow-hidden py-[2px] bg-[#0d0d0d]">
      <TickerRow reverse={false} />
      <div className="border-t border-white/[0.03]" />
      <TickerRow reverse={true} />
    </div>
  )
}
