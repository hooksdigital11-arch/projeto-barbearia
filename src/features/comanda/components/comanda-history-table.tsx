'use client'

import { ComandaItemWithRelations } from '../types'
import { Check, Clock } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'

interface ComandaHistoryTableProps {
  items: ComandaItemWithRelations[]
}

export function ComandaHistoryTable({ items }: ComandaHistoryTableProps) {
  // Group items by client and paid_at (unique transaction)
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
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Cliente</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Barbeiro</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground text-center">Itens</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Total</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Pagamento</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {records.map((row, idx) => (
              <tr key={idx} className="group/row hover:bg-white/[0.02] transition-all duration-300">
                <td className="px-8 py-6 font-bold text-white group-hover/row:text-accent-cyan transition-colors">{row.client}</td>
                <td className="px-8 py-6 text-sm text-text-secondary font-medium">{row.barber}</td>
                <td className="px-8 py-6 text-center">
                  <span className="px-2 py-1 rounded-lg bg-white/5 text-xs font-mono font-bold text-white">
                    {row.itemCount}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-base font-black text-white tracking-tight">
                    R$ {(row.total / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">
                    {row.method ? methodMap[row.method] : '—'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  {row.status === 'pago' ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                      <Check size={12} weight="bold" />
                      Pago
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest">
                      <Clock size={12} weight="bold" />
                      Aberta
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-32 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Clock size={48} weight="thin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Nenhuma comanda processada</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
