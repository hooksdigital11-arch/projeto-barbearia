'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <h2 className="text-2xl font-bold text-text-primary mb-4">Algo deu errado!</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {error.message || "Ocorreu um erro ao carregar a página de mensageria."}
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 rounded-xl bg-accent-cyan text-black font-bold hover:bg-accent-cyan/90 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  )
}
