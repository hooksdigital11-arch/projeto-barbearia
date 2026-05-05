'use client'

import { useEffect } from 'react'

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
  'b', 'a'
]

export function useKonamiCode(callback: () => void) {
  useEffect(() => {
    let keyIndex = 0

    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'a' ? e.key.toLowerCase() : e.code
      
      // Map Arrow codes to simple names if needed, but KONAMI_CODE uses Arrow codes
      if (key === KONAMI_CODE[keyIndex] || e.key === KONAMI_CODE[keyIndex]) {
        keyIndex++
        if (keyIndex === KONAMI_CODE.length) {
          callback()
          keyIndex = 0
        }
      } else {
        keyIndex = 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [callback])
}
