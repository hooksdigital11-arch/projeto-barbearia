'use client'

import { useEffect } from 'react'

const STORAGE_KEY = 'barbershop_theme'

interface ModeColors {
  bg: string
  surface: string
  sidebar: string
  surfaceSecondary: string
  navHover: string
  border: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  textNav: string
  foreground: string
}

const MODE_CONFIGS: Record<string, ModeColors> = {
  dark:          { bg: '#0a0a0a', surface: '#111111', sidebar: '#0f0f0f', surfaceSecondary: '#161616', navHover: '#161616', border: '#1e1e1e', textPrimary: '#ffffff', textSecondary: '#444444', textMuted: '#333333', textNav: '#555555', foreground: '#ffffff' },
  darker:        { bg: '#050505', surface: '#0a0a0a', sidebar: '#080808', surfaceSecondary: '#121212', navHover: '#121212', border: '#161616', textPrimary: '#ffffff', textSecondary: '#3a3a3a', textMuted: '#2a2a2a', textNav: '#4a4a4a', foreground: '#ffffff' },
  amoled:        { bg: '#000000', surface: '#080808', sidebar: '#000000', surfaceSecondary: '#101010', navHover: '#101010', border: '#111111', textPrimary: '#ffffff', textSecondary: '#333333', textMuted: '#222222', textNav: '#444444', foreground: '#ffffff' },
}

function applyModeColors(config: ModeColors) {
  const el = document.documentElement
  el.style.setProperty('--background', config.bg)
  el.style.setProperty('--foreground', config.foreground)
  el.style.setProperty('--color-bg-black', config.bg)
  el.style.setProperty('--color-bg-surface', config.surface)
  el.style.setProperty('--color-bg-sidebar', config.sidebar)
  el.style.setProperty('--color-surface-secondary', config.surfaceSecondary)
  el.style.setProperty('--color-nav-hover', config.navHover)
  el.style.setProperty('--color-border-main', config.border)
  el.style.setProperty('--color-text-primary', config.textPrimary)
  el.style.setProperty('--color-text-secondary', config.textSecondary)
  el.style.setProperty('--color-text-muted', config.textMuted)
  el.style.setProperty('--color-text-nav', config.textNav)
  el.style.setProperty('--border-main', config.border)
  el.style.setProperty('--surface-main', config.surface)
  document.body.style.backgroundColor = config.bg
}

/**
 * ThemeProvider — Loads saved theme from localStorage and applies
 * CSS custom properties on initial mount. Must be rendered inside the
 * root layout so the theme is restored on every page navigation.
 */
export function ThemeProvider() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return

      const parsed = JSON.parse(saved)
      if (parsed.accent) {
        document.documentElement.style.setProperty('--accent', parsed.accent)
        document.documentElement.style.setProperty('--color-accent-main', parsed.accent)
        document.documentElement.style.setProperty('--accent-main', parsed.accent)
      }
      if (parsed.secondary) {
        document.documentElement.style.setProperty('--secondary', parsed.secondary)
      }
      if (parsed.mode && MODE_CONFIGS[parsed.mode]) {
        applyModeColors(MODE_CONFIGS[parsed.mode]!)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  return null
}
