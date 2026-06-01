'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ─── Screen data ─────────────────────────────────────────────────────────────

const SCREENS = [
  {
    num: '01',
    label: 'Dashboard',
    caption: 'Visão completa do dia',
    detail: 'KPIs em tempo real, agenda de hoje e faturamento num só painel.',
    color: '#00d4aa',
    // Replace with: src: '/screenshots/dashboard.png'
  },
  {
    num: '02',
    label: 'Agendamentos',
    caption: 'Agenda de cada barbeiro',
    detail: 'Visualize, crie e gerencie horários. Clientes agendam pelo link sem ligar.',
    color: '#3b82f6',
  },
  {
    num: '03',
    label: 'Comanda Digital',
    caption: 'Feche em segundos',
    detail: 'Adicione serviços, produtos e finalize com PIX, cartão ou dinheiro.',
    color: '#f59e0b',
  },
  {
    num: '04',
    label: 'Fidelidade',
    caption: 'Clientes que sempre voltam',
    detail: 'Carimbos automáticos, resgates e histórico completo por cliente.',
    color: '#8b5cf6',
  },
  {
    num: '05',
    label: 'Relatórios',
    caption: 'Números reais, decisões certas',
    detail: 'Faturamento, ticket médio e desempenho por barbeiro. Exporta em PDF.',
    color: '#10b981',
  },
  {
    num: '06',
    label: 'WhatsApp Auto',
    caption: 'Automação de verdade',
    detail: 'Lembretes, confirmações e promoções saem sozinhos. Você não faz nada.',
    color: '#00d4aa',
  },
] as const

// ─── CSS-art placeholders (swap for real screenshots later) ──────────────────

function ScreenArt({ num, color }: { num: string; color: string }) {
  const Sidebar = ({ active }: { active: number }) => (
    <div className="w-[14%] shrink-0 bg-[#0e0e0e] border-r border-white/[0.04] flex flex-col items-center py-4 gap-3">
      <div className="w-5 h-5 rounded-md mb-1" style={{ background: color + '25', border: `1px solid ${color}50` }} />
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-4 h-4 rounded-[4px]"
          style={{ background: i === active ? color + '35' : 'rgba(255,255,255,0.05)' }}
        />
      ))}
    </div>
  )

  if (num === '01') return (
    <div className="h-full bg-[#080808] flex text-[0]">
      <Sidebar active={0} />
      <div className="flex-1 p-3 flex flex-col gap-2 overflow-hidden">
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 flex flex-col gap-1.5">
              <div className="h-1 w-8 rounded bg-white/10" />
              <div className="h-3 rounded" style={{ width: '70%', background: i === 0 ? color + '70' : 'rgba(255,255,255,0.14)' }} />
            </div>
          ))}
        </div>
        <div className="flex-1 rounded-lg border border-white/[0.05] bg-white/[0.02] p-2 relative overflow-hidden">
          <div className="absolute bottom-3 left-2 right-2 flex items-end gap-[3px]" style={{ height: '65%' }}>
            {[42, 68, 33, 82, 55, 91, 47, 73, 61, 88, 50, 77].map((h, i) => (
              <div key={i} className="flex-1 rounded-[2px]" style={{ height: `${h}%`, background: i >= 10 ? color : color + '28' }} />
            ))}
          </div>
        </div>
        <div className="space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-5 rounded bg-white/[0.04] flex items-center px-2 gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: [color, '#3b82f6', '#f59e0b'][i] + '90' }} />
              <div className="h-1 w-20 rounded bg-white/12" />
              <div className="ml-auto h-1 w-8 rounded bg-white/8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (num === '02') return (
    <div className="h-full bg-[#080808] flex text-[0]">
      <Sidebar active={1} />
      <div className="flex-1 p-3 flex flex-col gap-1.5 overflow-hidden">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S','T','Q','Q','S','S','D'].map((d, i) => (
            <div key={i} className="h-4 rounded-[3px] flex items-center justify-center" style={{ background: i === 4 ? color + '20' : 'transparent' }}>
              <div className="w-2 h-1 rounded bg-white/10" />
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 gap-1 overflow-hidden">
          {[...Array(7)].map((_, col) => (
            <div key={col} className="flex flex-col gap-[3px]">
              {[...Array(9)].map((_, row) => {
                const colors = [color, '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981']
                const hasAppt = (col * 3 + row * 2) % 5 === 0 || (col + row) % 4 === 0
                const c = colors[(col + row) % colors.length]
                return (
                  <div
                    key={row}
                    className="rounded-[2px]"
                    style={{
                      flex: 1,
                      minHeight: 5,
                      background: hasAppt ? c + '45' : 'rgba(255,255,255,0.03)',
                      border: hasAppt ? `1px solid ${c}65` : '1px solid transparent',
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (num === '03') return (
    <div className="h-full bg-[#080808] flex text-[0]">
      <Sidebar active={2} />
      <div className="flex-1 p-3 flex gap-2 overflow-hidden">
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-1.5 w-20 rounded bg-white/10 mb-0.5" />
          {[['Corte Degradê', '45'], ['Barba Completa', '30'], ['Sobrancelha', '20'], ['Pomada Widi', '35']].map(([, price], i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.04] border border-white/[0.06] px-2 py-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: [color, '#3b82f6', '#f59e0b', '#8b5cf6'][i] + '80' }} />
                <div className="h-1 w-14 rounded bg-white/18" />
              </div>
              <div className="h-1 w-6 rounded" style={{ background: color + '60' }} />
            </div>
          ))}
          <div className="mt-auto rounded-lg border border-white/[0.05] bg-white/[0.02] p-2">
            <div className="h-1 w-16 rounded bg-white/10 mb-2" />
            <div className="h-4 w-full rounded" style={{ background: color + '20', border: `1px solid ${color}40` }} />
          </div>
        </div>
        <div className="w-[36%] flex flex-col gap-1.5">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 space-y-1">
            {[['Subtotal', '60%'], ['Desconto', '30%'], ['Total', '80%']].map(([, w], i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-1 rounded bg-white/10" style={{ width: w }} />
                <div className="h-1 w-6 rounded" style={{ background: i === 2 ? color + '80' : 'rgba(255,255,255,0.15)' }} />
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {['PIX', 'Cartão', 'Dinheiro'].map((m, i) => (
              <div key={i} className="h-5 rounded-lg border flex items-center px-2 gap-1.5" style={{ borderColor: i === 0 ? color + '60' : 'rgba(255,255,255,0.06)', background: i === 0 ? color + '12' : 'rgba(255,255,255,0.03)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: i === 0 ? color : 'rgba(255,255,255,0.15)' }} />
                <div className="h-1 w-10 rounded bg-white/12" />
              </div>
            ))}
          </div>
          <div className="mt-auto h-7 rounded-lg" style={{ background: color + '40', border: `1px solid ${color}70` }} />
        </div>
      </div>
    </div>
  )

  if (num === '04') return (
    <div className="h-full bg-[#080808] flex text-[0]">
      <Sidebar active={3} />
      <div className="flex-1 p-3 flex flex-col gap-2 overflow-hidden">
        <div className="rounded-xl border p-3" style={{ borderColor: color + '35', background: color + '08' }}>
          <div className="h-1.5 w-24 rounded mb-3" style={{ background: color + '70' }} />
          <div className="flex gap-2 flex-wrap">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                style={{
                  background: i < 6 ? color + '50' : 'transparent',
                  borderColor: i < 6 ? color : 'rgba(255,255,255,0.18)',
                }}
              >
                {i < 6 && <div className="w-2 h-2 rounded-full" style={{ background: color }} />}
              </div>
            ))}
          </div>
          <div className="mt-2 h-1 w-3/4 rounded bg-white/10" />
        </div>
        <div className="flex-1 space-y-1 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-white/[0.035] border border-white/[0.05] px-2 py-1.5">
              <div className="w-5 h-5 rounded-full shrink-0" style={{ background: color + '25', border: `1px solid ${color}40` }} />
              <div className="h-1 w-14 rounded bg-white/15" />
              <div className="h-1.5 w-16 rounded ml-auto flex overflow-hidden gap-[2px]">
                {[...Array(8)].map((_, j) => (
                  <div key={j} className="flex-1 rounded-[1px]" style={{ background: j < ([6,8,4,7][i] ?? 0) ? color + '70' : 'rgba(255,255,255,0.08)' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (num === '05') return (
    <div className="h-full bg-[#080808] flex text-[0]">
      <Sidebar active={4} />
      <div className="flex-1 p-3 flex flex-col gap-2 overflow-hidden">
        <div className="grid grid-cols-3 gap-1.5">
          {[['Faturamento', color, '80%'], ['Ticket Médio', 'rgba(255,255,255,0.16)', '60%'], ['Atendimentos', 'rgba(255,255,255,0.16)', '50%']].map(([, c, w], i) => (
            <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
              <div className="h-1 w-12 rounded bg-white/10 mb-1.5" />
              <div className="h-3 rounded" style={{ width: w, background: c as string }} />
            </div>
          ))}
        </div>
        <div className="flex-1 rounded-lg border border-white/[0.05] bg-white/[0.02] p-2 relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 220 70" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`grad-${num}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              points="0,55 25,48 50,52 75,32 100,38 120,18 145,28 165,12 190,22 220,8"
              fill="none"
              stroke={color}
              strokeWidth="1.8"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points="0,55 25,48 50,52 75,32 100,38 120,18 145,28 165,12 190,22 220,8 220,70 0,70"
              fill={`url(#grad-${num})`}
            />
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {['Rafael', 'Thiago', 'Marcos'].map((name, i) => (
            <div key={i} className="rounded border border-white/[0.05] p-1.5 space-y-1">
              <div className="h-1 w-10 rounded bg-white/10" />
              <div className="h-2.5 rounded" style={{ width: ['80%', '60%', '70%'][i], background: ['#3b82f6', '#f59e0b', '#10b981'][i] + '60' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // 06: WhatsApp
  return (
    <div className="h-full bg-[#080808] flex text-[0]">
      <Sidebar active={0} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Contact list */}
        <div className="w-[38%] border-r border-white/[0.04] p-2 space-y-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5 rounded p-1.5" style={{ background: i === 0 ? color + '10' : 'transparent' }}>
              <div className="w-4 h-4 rounded-full shrink-0" style={{ background: [color, '#3b82f6', '#f59e0b', '#8b5cf6'][i] + '40' }} />
              <div className="space-y-0.5 flex-1">
                <div className="h-1 w-12 rounded bg-white/18" />
                <div className="h-1 w-16 rounded bg-white/8" />
              </div>
            </div>
          ))}
        </div>
        {/* Need flex-row for contact list + chat */}
      </div>
      {/* Re-structure: side-by-side */}
      <div className="absolute inset-0 flex text-[0]">
        <div className="w-[14%] bg-[#0e0e0e] border-r border-white/[0.04]" />
        {/* Contact list */}
        <div className="w-[30%] border-r border-white/[0.04] p-2 space-y-1 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-lg p-1.5" style={{ background: i === 0 ? color + '10' : 'rgba(255,255,255,0.02)' }}>
              <div className="w-5 h-5 rounded-full shrink-0" style={{ background: [color, '#3b82f6', '#f59e0b', '#8b5cf6'][i] + '40' }} />
              <div className="space-y-1 flex-1 overflow-hidden">
                <div className="h-1 w-12 rounded bg-white/18" />
                <div className="h-1 w-16 rounded bg-white/8" />
              </div>
              {i === 0 && <div className="w-3 h-3 rounded-full shrink-0 text-[6px] flex items-center justify-center" style={{ background: color }}>3</div>}
            </div>
          ))}
        </div>
        {/* Chat */}
        <div className="flex-1 flex flex-col p-2 gap-1.5 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 flex flex-col gap-1.5 overflow-hidden justify-end">
            {[
              { mine: false, w: '60%' },
              { mine: true,  w: '50%' },
              { mine: false, w: '72%' },
              { mine: true,  w: '40%' },
            ].map((msg, i) => (
              <div key={i} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="rounded-xl px-2 py-1.5"
                  style={{
                    width: msg.w,
                    background: msg.mine ? color + '28' : 'rgba(255,255,255,0.06)',
                    border: msg.mine ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="h-1 rounded bg-white/20 w-full" />
                </div>
              </div>
            ))}
          </div>
          {/* Auto badge */}
          <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 border" style={{ borderColor: color + '35', background: color + '08' }}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
            <div className="h-1 w-24 rounded" style={{ background: color + '50' }} />
            <div className="ml-auto h-1 w-8 rounded bg-white/8" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Browser frame wrapper ────────────────────────────────────────────────────

function BrowserFrame({ num, color, src }: { num: string; color: string; src?: string }) {
  const routes: Record<string, string> = {
    '01': 'admin', '02': 'admin/agendamentos',
    '03': 'barber/comanda', '04': 'admin/fidelidade',
    '05': 'admin/relatorios', '06': 'admin/mensagens',
  }

  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_32px_80px_-12px_rgba(0,0,0,0.8)]"
      style={{ background: '#111' }}
    >
      {/* Chrome bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#141414] border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28ca41]" />
        </div>
        <div className="flex-1 mx-4">
          <div className="h-5 bg-[#1a1a1a] rounded-md border border-white/[0.06] flex items-center px-2.5 gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color + '60' }} />
            <span
              className="font-mono text-[10px] text-white/30 select-none"
            >
              barberos.app/{routes[num]}
            </span>
          </div>
        </div>
      </div>

      {/* Screen content */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 9.5' }}>
        {src ? (
          // Real screenshot — add files to public/screenshots/
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`Tela ${num}`}
            className="w-full h-full object-cover object-top"
            draggable={false}
          />
        ) : (
          <ScreenArt num={num} color={color} />
        )}
      </div>
    </div>
  )
}

// ─── Gallery component ────────────────────────────────────────────────────────

export function LandingGallery() {
  const sectionRef  = useRef<HTMLElement>(null)
  const headerRef   = useRef<HTMLDivElement>(null)
  const trackRef    = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)   // right panel — actual visible width
  const counterRef  = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const section  = sectionRef.current
    const track    = trackRef.current
    const viewport = viewportRef.current
    const counter  = counterRef.current
    if (!section || !track || !viewport) return

    // Mobile: skip GSAP pin — native horizontal scroll is fine
    if (window.innerWidth < 768) return

    // KEY FIX: distance the track must travel =
    //   track's total content width  minus  the visible container (right panel) width.
    // Previously used track.offsetWidth which equals track.scrollWidth → always 0.
    const getDistance = () => Math.max(0, track.scrollWidth - viewport.offsetWidth)

    const ctx = gsap.context(() => {
      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1.1,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const idx = Math.round(self.progress * (SCREENS.length - 1))
            if (counter) counter.textContent = String(idx + 1).padStart(2, '0')
            section.querySelectorAll<HTMLElement>('[data-gallery-bar]').forEach((bar, j) => {
              const active = j === idx
              bar.style.flex    = active ? '2' : '1'
              bar.style.background = active ? '#00d4aa' : 'rgba(255,255,255,0.1)'
            })
          },
        },
      })

      // Panel content fades in as it enters the viewport from the right
      SCREENS.forEach((_, i) => {
        if (i === 0) return
        const panel   = track.children[i] as HTMLElement | undefined
        const content = panel?.querySelector<HTMLElement>('[data-panel-content]')
        if (!panel || !content) return
        gsap.fromTo(
          content,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: 'left 90%',
              once: true,
            },
          }
        )
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="bg-[#0a0a0a] border-t border-white/[0.05] overflow-hidden"
    >
      <div className="flex flex-col md:flex-row h-auto md:h-screen">

        {/* ── Left: sticky copy ── */}
        <div
          ref={headerRef}
          className="w-full md:w-[300px] xl:w-[340px] shrink-0 flex flex-col justify-center px-8 md:px-10 py-14 md:py-0 md:border-r border-white/[0.05]"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.42em] text-accent-main mb-5">
            O sistema
          </p>

          <h2 className="font-syne uppercase select-none mb-6">
            <span
              className="block font-medium leading-none"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', color: 'rgba(255,255,255,0.11)', letterSpacing: '-0.04em', lineHeight: 1 }}
            >
              Veja como é.
            </span>
            <span
              className="block font-medium leading-none"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1, marginTop: '-0.08em' }}
            >
              Na prática.
            </span>
          </h2>

          <p className="font-mono text-[10px] text-white/28 uppercase tracking-[0.2em] leading-[2] mb-10">
            Cada tela projetada pra economizar tempo. Do barbeiro ao dono.
          </p>

          {/* Progress counter */}
          <div className="flex items-center gap-3">
            <span
              ref={counterRef}
              className="font-syne text-[2rem] font-medium leading-none tracking-[-0.04em] text-accent-main"
            >
              01
            </span>
            <span className="font-syne text-[2rem] font-medium leading-none tracking-[-0.04em] text-white/12">
              / {String(SCREENS.length).padStart(2, '0')}
            </span>
          </div>

          <div className="flex gap-1.5 mt-4">
            {SCREENS.map((_, i) => (
              <div
                key={i}
                data-gallery-bar={i}
                className="h-[3px] rounded-full"
                style={{
                  flex: i === 0 ? 2 : 1,
                  background: i === 0 ? '#00d4aa' : 'rgba(255,255,255,0.1)',
                  transition: 'flex 0.4s ease, background 0.3s ease',
                }}
              />
            ))}
          </div>

          <p className="hidden md:block font-mono text-[8px] uppercase tracking-[0.25em] text-white/15 mt-8 flex items-center gap-2">
            ← role para explorar →
          </p>
        </div>

        {/* ── Right: scrollable track ── */}
        {/* Mobile: overflow-x-auto for native touch scroll */}
        {/* Desktop: overflow-hidden clips panels during GSAP x transform */}
        <div ref={viewportRef} className="flex-1 overflow-x-auto md:overflow-hidden flex items-center">
          <div
            ref={trackRef}
            className="flex gap-5 px-6 md:px-10 py-8 md:py-12"
            style={{ willChange: 'transform' }}
          >
            {SCREENS.map((screen) => (
              <div
                key={screen.num}
                className="shrink-0 flex flex-col gap-4"
                style={{ width: 'min(78vw, 560px)' }}
              >
                <BrowserFrame
                  num={screen.num}
                  color={screen.color}
                  // src={screen.src} // ← uncomment and add path when screenshots are ready
                />

                <div className="flex items-start gap-4 px-1">
                  <div
                    className="font-mono text-[9px] shrink-0 mt-[3px] px-1.5 py-0.5 rounded border"
                    style={{ color: screen.color, borderColor: screen.color + '40', background: screen.color + '10' }}
                  >
                    {screen.num}
                  </div>
                  <div>
                    <p className="font-syne text-[12px] font-medium uppercase tracking-[0.1em] text-white/80 mb-1">
                      {screen.caption}
                    </p>
                    <p className="font-mono text-[10px] text-white/28 leading-[1.8]">
                      {screen.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
