'use client'

import { DownloadSimple } from '@phosphor-icons/react/dist/ssr'

interface ExportCSVButtonProps {
  kpis: {
    totalRevenue: number
    averageTicket: number
    totalComandas: number
    totalDiscounts: number
  }
  chartData: { date: string; revenue: number; label?: string }[]
  paymentMethods: { method: string; value: number; percentage: number }[]
  barberPerformance: { barberName: string; revenue: number; appointments: number; avgTicket: number }[]
  period: string
  organizationName?: string
}

const formatBRL = (value: number) =>
  `R$ ${value.toFixed(2).replace('.', ',')}`

const generateCSV = (props: ExportCSVButtonProps): string => {
  const rows: string[] = []
  const now = new Date().toLocaleString('pt-BR')

  const esc = (val: unknown) => {
    const s = String(val ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }

  const row = (...cols: unknown[]) => rows.push(cols.map(esc).join(','))
  const blank = () => rows.push('')
  const section = (title: string) => {
    blank()
    row(title)
  }

  // ── Cabeçalho ──────────────────────────────
  row('RELATÓRIO DE DESEMPENHO')
  row('Barbearia', props.organizationName ?? 'Barbearia')
  row('Período', props.period)
  row('Gerado em', now)
  blank()

  // ── KPIs ───────────────────────────────────
  section('FINANCEIRO')
  row('Métrica', 'Valor')
  row('Receita Total', formatBRL(props.kpis.totalRevenue))
  row('Ticket Médio', formatBRL(props.kpis.averageTicket))
  row('Total de Atendimentos', props.kpis.totalComandas)
  row('Total de Descontos', formatBRL(props.kpis.totalDiscounts || 0))
  blank()

  // ── Receita por dia ─────────────────────────
  section('RECEITA POR DIA')
  row('Data', 'Receita (R$)')
  for (const d of props.chartData) {
    row(d.label || d.date, formatBRL(d.revenue))
  }
  blank()

  // ── Formas de pagamento ─────────────────────
  if (props.paymentMethods && props.paymentMethods.length > 0) {
    section('FORMAS DE PAGAMENTO')
    row('Método', 'Valor (R$)', 'Percentual')
    for (const p of props.paymentMethods) {
      row(p.method, formatBRL(p.value), `${p.percentage}%`)
    }
    blank()
  }

  // ── Performance por barbeiro ────────────────
  if (props.barberPerformance && props.barberPerformance.length > 0) {
    section('PERFORMANCE POR BARBEIRO')
    row('Barbeiro', 'Atendimentos', 'Receita (R$)', 'Ticket Médio (R$)')
    for (const b of props.barberPerformance) {
      row(b.barberName, b.appointments, formatBRL(b.revenue), formatBRL(b.avgTicket))
    }
  }

  return rows.join('\n')
}

export function ExportButton(props: ExportCSVButtonProps) {
  const handleExport = () => {
    const csv      = generateCSV(props)
    const bom      = '\uFEFF'
    const blob     = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url      = URL.createObjectURL(blob)
    const link     = document.createElement('a')
    const filename = `relatorio_${new Date().toISOString().split('T')[0]}.csv`

    link.href     = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
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
