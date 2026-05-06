'use client'

import { useEffect } from 'react'

/**
 * Error Boundary for the app.
 * Catches errors in page/layout components within the app directory.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Se for um erro de redirecionamento do Next.js, ignoramos o log
    if (error.message === 'NEXT_REDIRECT') return
    
    console.error('[ErrorBoundary]:', error)
  }, [error])

  // Se for um erro de redirecionamento, não mostramos a UI de erro
  // O Next.js deve processar o redirecionamento automaticamente
  if (error.message === 'NEXT_REDIRECT') {
    return null
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white font-syne">
            Algo deu errado
          </h2>
          <p className="text-sm text-gray-400">
            {error.message === 'NEXT_REDIRECT' ? 'Redirecionando...' : 'Ocorreu um erro inesperado. Tente novamente.'}
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl transition-all duration-300 active:scale-95"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  )
}

