'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (error.message === 'NEXT_REDIRECT') return
    Sentry.captureException(error)
  }, [error])

  if (error.message === 'NEXT_REDIRECT') {
    return null
  }

  return (
    <html>
      <body className="bg-bg-black text-text-primary flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <span className="text-4xl">🚫</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-syne">ERRO CRÍTICO</h2>
            <p className="text-muted-foreground">
              {error.message || "Ocorreu um erro fatal na aplicação."}
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="px-8 py-3 rounded-xl bg-accent-cyan text-black font-bold uppercase tracking-wider hover:bg-cyan-400 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </body>
    </html>
  )
}

