'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Star, ArrowRight } from '@phosphor-icons/react'

const PANELS = [
  {
    type: 'quote' as const,
    quote: 'Pagava R$110 por mês no sistema antigo. Com o BarberOS pago a hospedagem uma vez no ano. Só no primeiro ano já economizei mais de R$700.',
    name: 'Rafael Mendes',
    role: 'Barbearia Corte & Arte — São Paulo',
    accent: '#00d4aa',
  },
  {
    type: 'quote' as const,
    quote: 'O WhatsApp da barbearia era um caos. Hoje os lembretes saem sozinhos, os clientes confirmam automaticamente e o no-show caiu demais. Valeu cada centavo.',
    name: 'Thiago Carvalho',
    role: 'Studio 4 Barbeiros — Rio de Janeiro',
    accent: '#00d4aa',
  },
  {
    type: 'quote' as const,
    quote: 'Em 48h o sistema tava rodando. Minha agenda tá sempre cheia e eu parei de ficar no celular o dia todo respondendo mensagem.',
    name: 'Marcos Oliveira',
    role: 'Barbeiro e empreendedor — Belo Horizonte',
    accent: '#00d4aa',
  },
  {
    type: 'cta' as const,
    quote: '',
    name: '',
    role: '',
    accent: '#00d4aa',
  },
]

export function LandingHorizontal() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    // Mobile: no GSAP pin — panels stack vertically via CSS
    if (window.innerWidth < 768) return

    // Desktop: the track needs an explicit width wider than the viewport
    // so GSAP can calculate getDistance = track.scrollWidth - window.innerWidth
    track.style.width = `${PANELS.length * 100}vw`

    // Scope all animations to this component's context so cleanup
    // only affects THIS component's triggers, not others on the page.
    const ctx = gsap.context(() => {
      const getDistance = () => track.scrollWidth - window.innerWidth

      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          pin: true,
          scrub: 1.2,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      // Panel entrance animations tied to the horizontal scroll tween
      const panels = track.querySelectorAll<HTMLElement>('[data-panel]')
      panels.forEach((panel, i) => {
        if (i === 0) return
        const content = panel.querySelector('[data-panel-content]')
        if (!content) return
        gsap.fromTo(
          content,
          { opacity: 0, y: 28 },
          {
            opacity: 1, y: 0, duration: 0.65, ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: 'left 85%',
              once: true,
            },
          }
        )
      })
    }, container)

    return () => ctx.revert()
  }, [])

  return (
    <section className="border-t border-white/[0.05]" ref={containerRef}>
      {/*
        Mobile:  panels stack vertically (md:flex removed), each is full-width auto-height
        Desktop: GSAP pins the section and scrolls panels horizontally
      */}
      {/* track width set programmatically in useEffect only on desktop */}
      <div ref={trackRef} className="md:flex md:h-screen">
        {PANELS.map((panel, i) => (
          <div
            key={i}
            data-panel
            className="w-full md:w-screen py-20 md:py-0 md:h-full flex flex-col items-center justify-center px-6 md:px-20 relative overflow-hidden md:shrink-0"
            style={{
              background:
                i % 2 === 0
                  ? '#0a0a0a'
                  : '#0d0d0d',
            }}
          >
            {/* Panel number */}
            <span
              className="absolute top-12 right-12 font-syne font-medium select-none pointer-events-none"
              style={{ fontSize: 'clamp(6rem, 18vw, 14rem)', color: 'rgba(255,255,255,0.025)', letterSpacing: '-0.05em', lineHeight: 1 }}
            >
              0{i + 1}
            </span>

            {panel.type === 'quote' ? (
              <div data-panel-content className="max-w-3xl relative z-10">
                {/* Stars */}
                <div className="flex gap-1.5 mb-8">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={13} className="text-accent-main" weight="fill" />
                  ))}
                </div>

                {/* Quote */}
                <p
                  className="font-syne font-medium text-white leading-[1.1] tracking-[-0.02em] mb-10"
                  style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.8rem)' }}
                >
                  "{panel.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full border border-accent-main/30 flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(0,212,170,0.06)' }}
                  >
                    <span className="font-syne text-[13px] font-medium text-accent-main">
                      {panel.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-syne text-[13px] font-medium uppercase tracking-[0.08em] text-white/80">
                      {panel.name}
                    </p>
                    <p className="font-mono text-[10px] text-white/30 uppercase tracking-[0.18em] mt-0.5">
                      {panel.role}
                    </p>
                  </div>
                </div>

                {/* Panel indicator */}
                <div className="flex items-center gap-2 mt-12">
                  {PANELS.slice(0, -1).map((_, j) => (
                    <div
                      key={j}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: j === i ? '24px' : '6px',
                        height: '6px',
                        background: j === i ? '#00d4aa' : 'rgba(255,255,255,0.12)',
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* CTA Panel */
              <div data-panel-content className="max-w-2xl text-center relative z-10">
                <div className="inline-flex items-center gap-2 border border-accent-main/20 bg-accent-main/5 rounded-full px-4 py-[7px] mb-8">
                  <div className="w-[5px] h-[5px] rounded-full bg-accent-main lp-glow-pulse" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.38em] text-accent-main">
                    Pronto para começar?
                  </span>
                </div>

                <h2
                  className="font-syne font-medium uppercase leading-[0.9] tracking-[-0.04em] text-white mb-8"
                  style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
                >
                  Pare de pagar<br />
                  <span className="text-accent-main">mensalidade.</span>
                </h2>

                <p className="font-mono text-[11px] text-white/35 uppercase tracking-[0.22em] leading-[2] mb-10">
                  Implementação em 48h. Seus dados, sempre seus.
                </p>

                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <a
                    href="#planos"
                    className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] bg-accent-main text-black font-medium px-8 py-[14px] rounded-full hover:opacity-90 transition-all duration-300"
                  >
                    Ver planos
                    <ArrowRight size={12} weight="bold" />
                  </a>
                  <a
                    href="https://wa.me/5500000000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 border border-white/[0.11] px-8 py-[14px] rounded-full hover:border-white/30 hover:text-white/75 transition-all duration-300"
                  >
                    Falar agora
                  </a>
                </div>
              </div>
            )}

            {/* Scroll hint on first panel */}
            {i === 0 && (
              <div className="absolute bottom-10 right-12 flex items-center gap-3 opacity-30">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/60">role para ver</span>
                <ArrowRight size={11} className="text-white/60" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
