'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Calendar, ChartBar, WhatsappLogo, Star, Users, Scissors,
} from '@phosphor-icons/react'

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: Calendar,     number: '01', title: 'Agendamento 24/7',        description: 'Clientes agendam sozinhos a qualquer hora pelo link. Você dorme, a agenda trabalha.',                  color: '#00d4aa' },
  { icon: WhatsappLogo, number: '02', title: 'WhatsApp Automático',      description: 'Lembretes que reduzem no-show em até 70%. Confirmações e promoções sem você tocar.',                    color: '#25d366' },
  { icon: Star,         number: '03', title: 'Fidelidade Digital',       description: 'Carimbos automáticos após cada atendimento. Clientes voltam mais e gastam mais.',                        color: '#8b5cf6' },
  { icon: ChartBar,     number: '04', title: 'Financeiro em Tempo Real', description: 'Faturamento, ticket médio e comissões por barbeiro. Saiba onde está cada centavo.',                       color: '#3b82f6' },
  { icon: Users,        number: '05', title: 'Gestão de Equipe',         description: 'Painel individual por barbeiro. Agenda, comissões e desempenho separados, sem confusão.',                color: '#f59e0b' },
  { icon: Scissors,     number: '06', title: 'Comanda Digital',          description: 'Abra, feche, aplique desconto. Tudo num toque. Chega de caderninho, chega de perder conta.',             color: '#10b981' },
] as const

const CARD_H = 300
const GAP    = 14

// ─── Component ───────────────────────────────────────────────────────────────

export function LandingFeaturesSlider() {
  const sectionRef   = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const counterRef   = useRef<HTMLSpanElement>(null)
  const hintRef      = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const section   = sectionRef.current
    const container = containerRef.current
    if (!section || !container) return

    // Mobile: GSAP pin skipped — CSS grid renders the cards normally
    if (window.innerWidth < 768) return

    const n  = FEATURES.length
    const cW = container.offsetWidth // available width for cards

    // Compute card width so all n cards fit exactly in the container
    // (with PADDING_H on each side and GAP between cards)
    const PADDING_H = 48
    const cardW = Math.floor((cW - 2 * PADDING_H - (n - 1) * GAP) / n)

    // x position for card[cardIndex] when [visibleCount] cards are showing
    const cardX = (cardIndex: number, visibleCount: number): number => {
      const rowWidth  = visibleCount * cardW + (visibleCount - 1) * GAP
      const leftEdge  = (cW - rowWidth) / 2
      return leftEdge + cardIndex * (cardW + GAP)
    }

    const cards = gsap.utils.toArray<HTMLElement>('[data-feat-card]', container)

    // Apply computed widths
    cards.forEach(card => { card.style.width = `${cardW}px` })

    // ── Initial positions ──────────────────────────────────────────────────
    // Card 0: centered (single card view)
    // Cards 1-5: off-screen to the right
    gsap.set(cards[0]!, { x: cardX(0, 1) })
    cards.slice(1).forEach(card => gsap.set(card, { x: cW + cardW }))

    // ── Timeline ───────────────────────────────────────────────────────────
    // Each "step" i (i = 1..n-1) reveals card[i] and re-centres the growing row.
    // Duration is divided equally: each step occupies 1/(n-1) of total progress.
    const step = 1 / (n - 1)
    const tl   = gsap.timeline()

    for (let i = 1; i < n; i++) {
      const tStart = (i - 1) * step

      // New card slides in from the right to its place in the i+1-card row
      tl.fromTo(
        cards[i]!,
        { x: cW + cardW },
        { x: cardX(i, i + 1), ease: 'power3.out', duration: step, immediateRender: false },
        tStart
      )

      // All already-visible cards shift left to re-centre the growing row
      for (let j = 0; j < i; j++) {
        tl.to(
          cards[j]!,
          { x: cardX(j, i + 1), ease: 'power3.out', duration: step },
          tStart
        )
      }
    }

    // ── ScrollTrigger ──────────────────────────────────────────────────────
    const st = ScrollTrigger.create({
      trigger: section,
      pin:     true,
      scrub:   1,
      animation: tl,
      start: 'top top',
      end:   `+=${(n - 1) * 600}`,
      snap: {
        snapTo: step,
        duration: { min: 0.1, max: 0.45 },
        ease: 'power1.inOut',
      },
      onUpdate(self) {
        const visible = Math.min(n, Math.floor(self.progress * (n - 1)) + 1)
        if (counterRef.current) {
          counterRef.current.textContent =
            `${String(visible).padStart(2, '0')} / ${String(n).padStart(2, '0')}`
        }
        // Fade out scroll hint once all cards are visible
        if (hintRef.current) {
          hintRef.current.style.opacity = self.progress > 0.95 ? '0' : '1'
        }
      },
    })

    return () => { st.kill() }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="funcionalidades"
      className="border-t border-white/[0.05] relative"
      style={{ background: '#0a0a0a' }}
    >
      {/* ── Section label — always visible ── */}
      <div className="flex items-center gap-5 px-6 md:px-10 pt-8 md:pt-0 md:absolute md:top-8 md:left-10 md:right-10" style={{ zIndex: 10 }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent-main whitespace-nowrap">
          O que está incluso
        </p>
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span ref={counterRef} className="hidden md:inline font-mono text-[9px] uppercase tracking-[0.25em] text-white/25 whitespace-nowrap">
          01 / 06
        </span>
      </div>

      {/* ══ MOBILE: single-column card list ══ */}
      <div className="md:hidden flex flex-col gap-4 px-5 pt-6 pb-10">
        {FEATURES.map((f) => (
          <div
            key={f.number}
            style={{
              borderRadius: 16,
              background: 'linear-gradient(145deg, #141414 0%, #0f0f0f 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '20px',
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
            }}
          >
            {/* Icon */}
            <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: f.color + '18', border: `1px solid ${f.color}30` }}>
              <f.icon size={18} color={f.color} />
            </div>
            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="font-mono uppercase" style={{ fontSize: 8, letterSpacing: '0.3em', color: f.color + 'aa', display: 'block', marginBottom: 4 }}>{f.number}</span>
              <h3 className="font-syne font-medium uppercase" style={{ fontSize: 12, letterSpacing: '0.07em', color: '#fff', lineHeight: 1.3, marginBottom: 6 }}>{f.title}</h3>
              <p className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.8 }}>{f.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ══ DESKTOP: GSAP reveal animation (h-screen, pinned) ══ */}
      <div
        className="hidden md:block"
        style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}
      >
        {/* Cards container — GSAP moves cards inside here */}
        <div
          ref={containerRef}
          className="absolute inset-x-0 overflow-hidden"
          style={{ top: '50%', transform: 'translateY(-50%)', height: CARD_H }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.number}
              data-feat-card
              style={{
                position: 'absolute', top: 0, height: CARD_H, willChange: 'transform',
                borderRadius: 18,
                background: 'linear-gradient(145deg, #141414 0%, #0f0f0f 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '22px 20px',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 24px 60px -12px rgba(0,0,0,0.7)',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: f.color + '18', border: `1px solid ${f.color}30` }}>
                <f.icon size={20} color={f.color} />
              </div>
              <span className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: '0.35em', color: f.color + 'aa', marginBottom: 8 }}>{f.number}</span>
              <h3 className="font-syne font-medium uppercase" style={{ fontSize: 13, letterSpacing: '0.07em', color: '#fff', lineHeight: 1.25, marginBottom: 10 }}>{f.title}</h3>
              <div style={{ height: 1, background: f.color + '20', marginBottom: 10, flexShrink: 0 }} />
              <p className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', lineHeight: 1.8, flex: 1 }}>{f.description}</p>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: f.color + '70', marginTop: 12, flexShrink: 0 }} />
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div
          ref={hintRef}
          className="absolute"
          style={{ bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'opacity 0.5s ease' }}
        >
          <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/18">role para revelar</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, opacity: 0.3 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ width: 6, height: 6, borderRight: '1.5px solid #00d4aa', borderBottom: '1.5px solid #00d4aa', transform: 'rotate(45deg)', animation: `introChevron 1.4s ease-in-out ${i * 0.15}s infinite` }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
