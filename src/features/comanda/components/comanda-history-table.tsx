'use client'

import { ComandaItemWithRelations } from '../types'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Clock } from 'lucide-react'

interface ComandaHistoryTableProps {
  items: ComandaItemWithRelations[]
}

export function ComandaHistoryTable({ items }: ComandaHistoryTableProps) {
  // Group items by client and paid_at (unique transaction)
  // For simplicity, we'll treat each paid item as a record, or group by client+time
  const grouped = items.reduce((acc, item) => {
    const key = `${item.client_id}-${item.paid_at}`
    if (!acc[key]) {
      acc[key] = {
        client: item.client?.full_name || 'Desconhecido',
        barber: item.barber?.full_name || 'Desconhecido',
        itemCount: 0,
        total: 0,
        method: item.payment_method,
        status: item.paid ? 'pago' : 'aberta',
        time: item.paid_at || item.created_at
      }
    }
    acc[key].itemCount += 1
    acc[key].total += item.total_cents
    return acc
  }, {} as Record<string, any>)

  const records = Object.values(grouped).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  const methodMap: Record<string, string> = {
    cash: 'Dinheiro',
    pix: 'PIX',
    credit_card: 'Crédito',
    debit_card: 'Débito',
  }

  return (
    <div className="rounded-xl border border-white/5 overflow-hidden">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-[#141414] text-muted-foreground font-medium uppercase text-xs">
          <tr>
            <th className="px-6 py-4">Cliente</th>
            <th className="px-6 py-4">Barbeiro</th>
            <th className="px-6 py-4">Itens</th>
            <th className="px-6 py-4">Total</th>
            <th className="px-6 py-4">Pagamento</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-[#0a0a0a]">
          {records.map((row, idx) => (
            <tr key={idx} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-medium text-white">{row.client}</td>
              <td className="px-6 py-4 text-muted-foreground">{row.barber}</td>
              <td className="px-6 py-4 text-center text-white">{row.itemCount}</td>
              <td className="px-6 py-4 font-semibold text-white">R$ {(row.total / 100).toFixed(2)}</td>
              <td className="px-6 py-4 text-muted-foreground">
                {row.method ? methodMap[row.method] : '—'}
              </td>
              <td className="px-6 py-4">
                {row.status === 'pago' ? (
                  <span className="flex items-center gap-1 text-success text-xs font-bold uppercase">
                    Pago <Check className="w-3 h-3" />
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-accent text-xs font-bold uppercase">
                    Aberta <Clock className="w-3 h-3" />
                  </span>
                )}
              </td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                Nenhuma comanda encontrada no período.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
