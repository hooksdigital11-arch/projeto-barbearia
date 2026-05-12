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
        client: item.client?.full_name || 'DESCONHECIDO',
        barber: item.barber?.full_name || 'DESCONHECIDO',
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
    cash: 'DINHEIRO',
    pix: 'PIX',
    credit_card: 'CRÉDITO',
    debit_card: 'DÉBITO',
  }

  return (
    <div className="space-y-[4px]">
      {records.map((row, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[1.8fr_1.4fr_70px_100px_110px_90px] gap-[14px] items-center bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] py-[14px] px-[18px] group hover:bg-bg-surface hover:border-[#222] transition-all"
        >
          {/* Cliente */}
          <span className="text-[12px] font-medium text-text-secondary truncate uppercase tracking-tight">
            {row.client}
          </span>

          {/* Barbeiro */}
          <span className="text-[10px] font-medium text-[#333] truncate uppercase tracking-wide">
            {row.barber}
          </span>

          {/* Itens */}
          <div className="flex justify-center">
            <span className="text-[10px] font-medium text-text-nav bg-white/[0.02] border-[0.5px] border-white/5 px-2 py-0.5 rounded-[4px]">
              {row.itemCount}
            </span>
          </div>

          {/* Total */}
          <div className="text-right">
            <span className="text-[13px] font-medium text-text-secondary tracking-tight tabular-nums">
              R$ {(row.total / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>

          {/* Pagamento */}
          <div className="flex justify-center">
            <span className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-widest">
              {row.method ? methodMap[row.method] : '—'}
            </span>
          </div>

          {/* Status */}
          <div className="flex justify-end">
            {row.status === 'pago' ? (
              <div className="flex items-center gap-1.5 text-accent-main">
                <div className="w-[4px] h-[4px] rounded-full bg-accent-main" />
                <span className="text-[9px] font-medium uppercase tracking-[0.05em]">PAGO</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-500/80">
                <div className="w-[4px] h-[4px] rounded-full bg-amber-500" />
                <span className="text-[9px] font-medium uppercase tracking-[0.05em]">ABERTA</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
