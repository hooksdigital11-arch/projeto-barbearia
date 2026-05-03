'use client'

/**
 * Global Error Boundary
 * Catches errors in the root layout. Required by Next.js App Router.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white font-syne">
              Algo deu errado
            </h2>
            <p className="text-sm text-gray-400">
              Ocorreu um erro inesperado. Tente novamente.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl transition-all duration-300 active:scale-95"
          >
            Tentar Novamente
          </button>
        </div>
      </body>
    </html>
  )
}
