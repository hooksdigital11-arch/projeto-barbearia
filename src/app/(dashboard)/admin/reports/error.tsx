'use client'

import { useEffect } from 'react'
import { PageTitle } from '@/components/shared/page-title'
import { Warning } from '@phosphor-icons/react/dist/ssr'

export default function ReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Reports Error:', error)
  }, [error])

  return (
    <div className="space-y-8 pb-20">
      <PageTitle 
        title="Erro ao Carregar Relatórios" 
        subtitle="Houve um problema ao buscar os dados para a análise." 
      />
      
      <div className="flex flex-col items-center justify-center p-12 bg-bg-secondary/50 border border-red-500/10 rounded-2xl backdrop-blur-xl">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
          <Warning size={32} weight="duotone" />
        </div>
        <h3 className="text-xl font-syne font-bold text-white mb-2">Ops! Algo deu errado.</h3>
        <p className="text-text-secondary text-center max-w-md mb-8">
          {error.message || 'Ocorreu um erro inesperado ao tentar processar os relatórios.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors active:scale-95"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
