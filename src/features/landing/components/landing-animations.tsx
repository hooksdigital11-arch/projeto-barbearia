'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function LandingAnimations() {
  const ctxRef     = useRef<gsap.Context | null>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    // ── Core animation setup ────────────────────────────────────────────────
    // Called ONLY after LandingIntro fires 'landing:ready'.
    // This ensures every animation plays visibly instead of firing
    // while the intro overlay covers the page.
    const run = () => {
      if (!mountedRef.current) return

      gsap.registerPlugin(ScrollTrigger)

      // Recalculate all trigger positions after layout stabilises
      timerRef.current = setTimeout(() => ScrollTrigger.refresh(), 350)

      ctxRef.current = gsap.context(() => {

        // ── HERO ENTRANCE TIMELINE ─────────────────────────────────────────
        gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
          .from('[data-gsap="hero-badge"]', {
            opacity: 0, scale: 0.86, y: 12,
            duration: 0.55, ease: 'back.out(1.8)',
          })
          .from('[data-gsap="hero-headline"]', {
            opacity: 0, y: 48, duration: 1,
          }, '-=0.22')
          .from('[data-gsap="hero-sub"]', {
            opacity: 0, duration: 0.75, ease: 'power2.out',
          }, '-=0.5')
          .from('[data-gsap="hero-ctas"]', {
            opacity: 0, y: 18, duration: 0.65, ease: 'power2.out',
          }, '-=0.45')
          .from('[data-gsap="hero-scroll"]', {
            opacity: 0, duration: 0.5, ease: 'none',
          }, '-=0.2')

        // ── LINE REVEAL ───────────────────────────────────────────────────
        gsap.utils.toArray<HTMLElement>('[data-gsap="line-reveal"]').forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: 'inset(0 100% 0 0)', x: -10, opacity: 0.4 },
            {
              clipPath: 'inset(0 0% 0 0)', x: 0, opacity: 1,
              duration: 1, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top bottom', once: true },
            }
          )
        })

        // ── WORD-BY-WORD REVEAL ──────────────────────────────────────────
        gsap.utils.toArray<HTMLElement>('[data-gsap="word-reveal"]').forEach((el) => {
          const original = el.innerHTML
          el.innerHTML = original.replace(
            /(?<=>|\s|^)([^\s<]+)(?=\s|<|$)/g,
            (m) =>
              `<span style="overflow:hidden;display:inline-block;vertical-align:bottom;line-height:inherit"><span data-w style="display:inline-block">${m}</span></span>`
          )
          gsap.from(el.querySelectorAll('[data-w]'), {
            yPercent: 115, opacity: 0,
            duration: 0.6, stagger: { each: 0.055, ease: 'power1.in' }, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top bottom', once: true },
          })
        })

        // ── ANIMATED COUNTERS ────────────────────────────────────────────
        gsap.utils.toArray<HTMLElement>('[data-gsap="counter"]').forEach((el) => {
          const target = +(el.dataset.value ?? 0)
          const suffix = el.dataset.suffix ?? ''
          const prefix = el.dataset.prefix ?? ''
          const proxy = { val: 0 }
          gsap.to(proxy, {
            val: target, duration: 1.8, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            onUpdate() {
              el.textContent = prefix + Math.round(proxy.val).toLocaleString('pt-BR') + suffix
            },
          })
        })

        // ── FADE UP ──────────────────────────────────────────────────────
        gsap.utils.toArray<HTMLElement>('[data-gsap="fade-up"]').forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 24 },
            {
              opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
              delay: +(el.dataset.delay ?? 0) / 1000,
              scrollTrigger: { trigger: el, start: 'top bottom', once: true },
            }
          )
        })

        // ── SLIDE FROM SIDES ─────────────────────────────────────────────
        gsap.utils.toArray<HTMLElement>('[data-gsap="slide-left"]').forEach((el) => {
          gsap.fromTo(el,
            { opacity: 0, x: -55 },
            { opacity: 1, x: 0, duration: 0.9, ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top bottom', once: true } }
          )
        })
        gsap.utils.toArray<HTMLElement>('[data-gsap="slide-right"]').forEach((el) => {
          gsap.fromTo(el,
            { opacity: 0, x: 55 },
            { opacity: 1, x: 0, duration: 0.9, ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top bottom', once: true } }
          )
        })

        // ── STAGGER GROUPS ───────────────────────────────────────────────
        gsap.utils.toArray<HTMLElement>('[data-gsap-stagger]').forEach((container) => {
          const children = gsap.utils.toArray<HTMLElement>('[data-gsap-child]', container)
          if (!children.length) return

          const stagger = +(container.dataset.stagger ?? 0.09)
          const from    = container.dataset.from ?? 'bottom'
          const scale   = container.dataset.scale === '1'

          gsap.fromTo(
            children,
            {
              opacity: 0,
              y: from === 'bottom' ? 30 : 0,
              x: from === 'left'   ? -24 : 0,
              ...(scale ? { scale: 0.95 } : {}),
            },
            {
              opacity: 1, y: 0, x: 0, ...(scale ? { scale: 1 } : {}),
              duration: 0.75, ease: 'power2.out', stagger,
              scrollTrigger: { trigger: container, start: 'top bottom', once: true },
            }
          )
        })

        // ── PRICING CARDS ────────────────────────────────────────────────
        const pricingContainer = document.querySelector<HTMLElement>('[data-gsap-pricing]')
        if (pricingContainer) {
          const cards = gsap.utils.toArray<HTMLElement>('[data-gsap-pricing-card]', pricingContainer)
          gsap.fromTo(
            cards,
            { opacity: 0, y: 44, scale: 0.94 },
            {
              opacity: 1, y: 0, scale: 1,
              duration: 0.8, ease: 'power3.out',
              stagger: { each: 0.12, ease: 'power1.in' },
              scrollTrigger: { trigger: pricingContainer, start: 'top bottom', once: true },
            }
          )
        }

        // ── PROOF BAR ACCENT LINE ────────────────────────────────────────
        const proofAccent = document.querySelector<HTMLElement>('[data-gsap="proof-accent"]')
        if (proofAccent) {
          gsap.fromTo(
            proofAccent,
            { scaleX: 0 },
            {
              scaleX: 1, transformOrigin: 'left center', duration: 1.2, ease: 'power3.out',
              scrollTrigger: { trigger: proofAccent, start: 'top 90%', once: true },
            }
          )
        }

      })
    }

    // ── Timing coordination with LandingIntro ────────────────────────────
    // LandingIntro dispatches 'landing:ready' when its reveal animation ends.
    // We listen for that event so animations only start AFTER the page is visible.
    // If no intro is present (e.g. direct navigation to /#funcionalidades),
    // we start immediately via the fallback below.
    document.addEventListener('landing:ready', run, { once: true })

    // Fallback: if LandingIntro is absent or never dismissed within 8 s,
    // start animations anyway so the page is never stuck invisible.
    const fallback = setTimeout(run, 8000)

    return () => {
      mountedRef.current = false
      clearTimeout(fallback)
      if (timerRef.current) clearTimeout(timerRef.current)
      document.removeEventListener('landing:ready', run)
      ctxRef.current?.revert()
    }
  }, [])

  return null
}
