'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'barbershop_theme'

/**
 * Reactive hook that returns current theme colors.
 * Listens for storage events and CSS variable changes so
 * Chart.js and other imperative consumers re-render on theme swap.
 */
export function useThemeColors() {
  const [accent, setAccent] = useState('#00d4aa')
  const [secondary, setSecondary] = useState('#5c35a0')

  useEffect(() => {
    const read = () => {
      const a = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
      const s = getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim()
      if (a) setAccent(a)
      if (s) setSecondary(s)
    }

    // Initial read
    read()

    // Listen for localStorage changes (from Appearance settings)
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) read()
    }
    window.addEventListener('storage', onStorage)

    // Poll for CSS variable changes (same-tab updates)
    const interval = setInterval(read, 500)

    return () => {
      window.removeEventListener('storage', onStorage)
      clearInterval(interval)
    }
  }, [])

  return { accent, secondary }
}
