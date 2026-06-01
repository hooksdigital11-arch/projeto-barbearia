'use client'

import { useEffect } from 'react'
import gsap from 'gsap'

// Inline SVG strings — HTML attributes (kebab-case), not JSX props
const ICONS = [
  // Scissors
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="8" cy="8" r="4"/>
    <circle cx="8" cy="24" r="4"/>
    <path d="M11.5 5.5 L27 21"/>
    <path d="M11.5 26.5 L27 11"/>
  </svg>`,
  // Straight razor
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 13 L3 19 L4 20 L24 20 L28 16 L24 12 L4 12 L3 13 Z"/>
    <line x1="22" y1="12" x2="22" y2="20"/>
    <line x1="8" y1="12" x2="8" y2="20" stroke-opacity="0.4"/>
  </svg>`,
  // Comb
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <rect x="2" y="9" width="28" height="8" rx="2"/>
    <line x1="7"  y1="17" x2="7"  y2="25"/>
    <line x1="12" y1="17" x2="12" y2="25"/>
    <line x1="17" y1="17" x2="17" y2="25"/>
    <line x1="22" y1="17" x2="22" y2="25"/>
    <line x1="27" y1="17" x2="27" y2="25"/>
  </svg>`,
  // Barber pole
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <rect x="11" y="3" width="10" height="26" rx="5"/>
    <path d="M11 9 Q21 13 11 17 Q21 21 11 25" stroke-width="1.5" stroke-opacity="0.55"/>
  </svg>`,
  // Sparkle / star
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <line x1="16" y1="2"  x2="16" y2="9"/>
    <line x1="16" y1="23" x2="16" y2="30"/>
    <line x1="2"  y1="16" x2="9"  y2="16"/>
    <line x1="23" y1="16" x2="30" y2="16"/>
    <line x1="6"  y1="6"  x2="11" y2="11"/>
    <line x1="21" y1="21" x2="26" y2="26"/>
    <line x1="26" y1="6"  x2="21" y2="11"/>
    <line x1="11" y1="21" x2="6"  y2="26"/>
  </svg>`,
]

export function CursorTrail() {
  useEffect(() => {
    // Only on pointer-fine devices (desktop)
    if (!window.matchMedia('(pointer: fine)').matches) return

    const POOL = 14
    const SIZE = 26
    const MIN_DIST = 36

    const pool: HTMLDivElement[] = []
    let idx = 0
    let lastX = -999
    let lastY = -999

    // Build element pool
    for (let i = 0; i < POOL; i++) {
      const el = document.createElement('div')
      el.style.cssText = [
        'position:fixed',
        'pointer-events:none',
        `z-index:9996`,
        'opacity:0',
        'color:#00d4aa',
        `width:${SIZE}px`,
        `height:${SIZE}px`,
        'transform-origin:center center',
        'will-change:transform,opacity',
      ].join(';')
      el.innerHTML = ICONS[i % ICONS.length] ?? ''
      document.body.appendChild(el)
      pool.push(el)
    }

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      if (Math.sqrt(dx * dx + dy * dy) < MIN_DIST) return

      lastX = e.clientX
      lastY = e.clientY

      const el = pool[idx % POOL]
      idx++
      if (!el) return

      // Direction-based rotation
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)
      const scatter = (Math.random() - 0.5) * 50

      gsap.killTweensOf(el)
      gsap.set(el, {
        x: e.clientX - SIZE / 2,
        y: e.clientY - SIZE / 2,
        rotation: angle + scatter,
        scale: 0.25,
        opacity: 0.85,
      })
      gsap.to(el, {
        scale: 0.75 + Math.random() * 0.5,
        opacity: 0,
        rotation: angle + scatter + (Math.random() - 0.5) * 70,
        y: `+=${18 + Math.random() * 22}`,
        x: `+=${(Math.random() - 0.5) * 20}`,
        duration: 0.7 + Math.random() * 0.5,
        ease: 'power2.out',
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      pool.forEach((el) => el.remove())
    }
  }, [])

  return null
}
