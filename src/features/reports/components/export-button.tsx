'use client'

import { DownloadSimple } from '@phosphor-icons/react/dist/ssr'
import { toast } from 'sonner'

interface ExportButtonProps {
  startDate: string
  endDate: string
}

export function ExportButton({ startDate, endDate }: ExportButtonProps) {
  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Gerando relatório CSV...',
        success: 'Relatório baixado com sucesso!',
        error: 'Erro ao gerar relatório.',
      }
    )

    // CSV Generation Logic would go here
    const headers = ['Data', 'Receita', 'Atendimentos', 'Novos Clientes']
    const data = [
      ['2026-05-01', '1250.00', '15', '3'],
      ['2026-05-02', '980.50', '12', '1'],
    ]

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_barbearia_${startDate.slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent-cyan text-black font-bold uppercase tracking-wider text-xs hover:bg-accent-cyan/90 transition-all shadow-lg shadow-accent-cyan/20"
    >
      <DownloadSimple size={18} weight="bold" />
      Exportar CSV
    </button>
  )
}
