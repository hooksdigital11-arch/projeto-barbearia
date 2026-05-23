'use client'

import { Package, PencilSimple, ArrowsDownUp, Trash } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import type { InventoryItem } from '../types'

interface InventoryTableProps {
  items: InventoryItem[]
  onEdit: (item: InventoryItem) => void
  onMove: (item: InventoryItem) => void
  onDelete: (item: InventoryItem) => void
  canManage: boolean
  showCost: boolean
  salesData: Map<string, { qtdVendida: number, faturamento: number }>
}

export function InventoryTable({
  items, onEdit, onMove, onDelete, canManage, showCost, salesData
}: InventoryTableProps) {
  const formatPrice = (cents: number | null | undefined) => {
    if (cents === null || cents === undefined) return '—'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
  }

  return (
    <div className="space-y-[4px]">
      {/* Desktop header — hidden on mobile */}
      <div className="hidden lg:grid grid-cols-[2fr_100px_70px_90px_90px_70px_110px_70px] gap-[12px] px-[18px] py-1">
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">PRODUTO</span>
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838] text-center">TIPO</span>
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838] text-center">ESTOQUE</span>
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838] text-right">CUSTO</span>
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838] text-right">PREÇO VENDA</span>
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838] text-center">QTD VENDIDA</span>
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838] text-right">FATURAMENTO</span>
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838] text-right">AÇÕES</span>
      </div>

      {items.map((item) => {
        const isLowStock = item.quantity <= (item.min_quantity ?? 5)
        const isOut = item.quantity === 0
        const isRevenda = item.type === 'revenda'
        const sale = salesData.get(item.id)
        const qtdVendida = sale?.qtdVendida ?? 0
        const faturamento = sale?.faturamento ?? 0

        return (
          <div key={item.id} className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] group hover:bg-bg-surface transition-all">
            {/* Mobile card layout */}
            <div className="lg:hidden p-[14px] flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-[32px] h-[32px] rounded-[7px] bg-bg-surface border-[0.5px] border-border-main flex items-center justify-center text-[#444] shrink-0">
                    <Package size={16} weight="regular" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-text-secondary uppercase tracking-tight truncate">{item.name}</p>
                    <span className="text-[9px] text-[#2e2e2e] font-medium uppercase tracking-[0.06em]">{item.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isRevenda ? (
                    <span className="text-[9px] px-[7px] py-[3px] rounded-[5px] bg-[#0d2e1a] text-[#00c070] border-[0.5px] border-[#00c07033] font-medium uppercase">REVENDA</span>
                  ) : (
                    <span className="text-[9px] px-[7px] py-[3px] rounded-[5px] bg-bg-surface text-[#333] font-medium uppercase">INTERNO</span>
                  )}
                  <span className={cn(
                    "text-[13px] font-medium tabular-nums",
                    isOut ? "text-red-500" : isLowStock ? "text-amber-500" : "text-[#444]"
                  )}>
                    {item.quantity}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pl-[44px]">
                <div className="flex items-center gap-3 text-[10px] text-[#444] font-medium uppercase">
                  {showCost && isRevenda && (
                    <span>C: {formatPrice(item.cost_cents).replace('R$', '').trim()}</span>
                  )}
                  {isRevenda && (
                    <span>V: {formatPrice(item.price_cents).replace('R$', '').trim()}</span>
                  )}
                  {isRevenda && (
                    <span className="text-accent-main">{formatPrice(faturamento).replace('R$', '').trim()}</span>
                  )}
                </div>
                <div className="flex items-center gap-0 -mr-2">
                  {canManage && (
                    <button onClick={() => onEdit(item)} className="w-11 h-11 flex items-center justify-center text-[#2e2e2e] hover:text-[#666] transition-all" title="Editar">
                      <PencilSimple size={14} />
                    </button>
                  )}
                  <button onClick={() => onMove(item)} className="w-11 h-11 flex items-center justify-center text-[#2e2e2e] hover:text-[#666] transition-all" title="Movimentar">
                    <ArrowsDownUp size={14} />
                  </button>
                  {canManage && (
                    <button onClick={() => onDelete(item)} className="w-11 h-11 flex items-center justify-center text-[#2e2e2e] hover:text-[#666] transition-all" title="Deletar">
                      <Trash size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop table row */}
            <div className="hidden lg:grid grid-cols-[2fr_100px_70px_90px_90px_70px_110px_70px] gap-[12px] items-center py-[13px] px-[18px]">
              <div className="flex items-center gap-3 truncate">
                <div className="w-[32px] h-[32px] rounded-[7px] bg-bg-surface border-[0.5px] border-border-main flex items-center justify-center text-[#444] shrink-0">
                  <Package size={16} weight="regular" />
                </div>
                <div className="truncate">
                  <p className="text-[12px] font-medium text-text-secondary uppercase tracking-tight truncate">{item.name}</p>
                  <span className="text-[9px] text-[#2e2e2e] font-medium uppercase tracking-[0.06em]">{item.category}</span>
                </div>
              </div>

              <div className="flex justify-center">
                {isRevenda ? (
                  <span className="text-[9px] px-[9px] py-[3px] rounded-[5px] bg-[#0d2e1a] text-[#00c070] border-[0.5px] border-[#00c07033] font-medium uppercase">REVENDA</span>
                ) : (
                  <span className="text-[9px] px-[9px] py-[3px] rounded-[5px] bg-bg-surface text-[#333] font-medium uppercase">USO INTERNO</span>
                )}
              </div>

              <div className="text-center">
                <span className={cn(
                  "text-[11px] font-medium tabular-nums",
                  isOut ? "text-red-500" : isLowStock ? "text-amber-500" : "text-[#444]"
                )}>
                  {item.quantity}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-medium text-[#333] tabular-nums">
                  {showCost ? formatPrice(item.cost_cents).replace('R$', '').trim() : '—'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-medium text-[#444] tabular-nums">
                  {isRevenda ? formatPrice(item.price_cents).replace('R$', '').trim() : '—'}
                </span>
              </div>

              <div className="text-center">
                <span className="text-[11px] font-medium text-[#333] tabular-nums">
                  {isRevenda ? qtdVendida : '—'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-medium text-accent-main tabular-nums">
                  {isRevenda ? formatPrice(faturamento).replace('R$', '').trim() : '—'}
                </span>
              </div>

              <div className="flex items-center gap-[10px] justify-end">
                {canManage && (
                  <button onClick={() => onEdit(item)} className="text-[#2e2e2e] hover:text-[#666] transition-all" title="Editar">
                    <PencilSimple size={14} />
                  </button>
                )}
                <button onClick={() => onMove(item)} className="text-[#2e2e2e] hover:text-[#666] transition-all" title="Movimentar">
                  <ArrowsDownUp size={14} />
                </button>
                {canManage && (
                  <button onClick={() => onDelete(item)} className="text-[#2e2e2e] hover:text-[#666] transition-all" title="Deletar">
                    <Trash size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {items.length === 0 && (
        <div className="bg-bg-sidebar border-[0.5px] border-dashed border-border-main rounded-[10px] p-[60px] text-center">
          <Package size={32} weight="regular" className="text-[#1e1e1e] mx-auto mb-4" />
          <p className="text-[10px] font-medium text-[#222] tracking-[0.1em] uppercase">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  )
}
