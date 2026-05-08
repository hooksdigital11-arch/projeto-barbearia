'use client'

import { Package, PencilSimple, ArrowsDownUp, Trash, Warning, MinusCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import type { InventoryItem } from '../types'

interface InventoryTableProps {
  items: InventoryItem[]
  onEdit: (item: InventoryItem) => void
  onMove: (item: InventoryItem) => void
  onDelete: (item: InventoryItem) => void
  canManage: boolean
  showCost: boolean
  period: 'hoje' | 'semana' | 'mes' | 'ano'
  salesData: Map<string, { qtdVendida: number, faturamento: number }>
  isLoading?: boolean
}

export function InventoryTable({ 
  items, onEdit, onMove, onDelete, canManage, showCost, period, salesData, isLoading 
}: InventoryTableProps) {
  const formatPrice = (cents: number | null | undefined) => {
    if (cents === null || cents === undefined) return '—'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
  }

  return (
    <div className="bg-bg-secondary/50 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Produto</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Estoque</th>
              {showCost && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Custo</th>}
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preço Venda</th>
              <th className="hidden md:table-cell px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Qtd Vendida</th>
              <th className="hidden md:table-cell px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Faturamento</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((item) => {
              const isLowStock = item.quantity <= (item.min_quantity ?? 5)
              const isOut = item.quantity === 0
              const isRevenda = item.type === 'revenda'
              
              // Dados de venda REAIS do Map
              const sale = salesData.get(item.id)
              const qtdVendida = sale?.qtdVendida ?? 0
              const faturamento = sale?.faturamento ?? 0

              return (
                <tr 
                  key={item.id} 
                  className={cn(
                    "hover:bg-white/[0.02] transition-colors group",
                    isOut ? "bg-red-500/5 border-l-2 border-red-500" : 
                    isLowStock ? "bg-amber-500/5 border-l-2 border-amber-500" : ""
                  )}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        isOut ? "bg-red-500/20 text-red-400" :
                        isLowStock ? "bg-amber-500/20 text-amber-400" : "bg-accent-blue/10 text-accent-blue"
                      )}>
                        <Package size={20} weight="duotone" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{item.name}</p>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{item.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border",
                      isRevenda 
                        ? "bg-green-500/10 text-green-400 border-green-500/20" 
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    )}>
                      {isRevenda ? 'Revenda' : 'Uso Interno'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center">
                      <p className={cn(
                        "font-bold text-sm flex items-center gap-1.5",
                        isOut ? "text-red-400" : isLowStock ? "text-amber-400" : "text-white"
                      )}>
                        {item.quantity}
                        {isOut ? <MinusCircle size={14} weight="fill" /> : isLowStock ? <Warning size={14} weight="fill" /> : null}
                      </p>
                    </div>
                  </td>
                  {showCost && (
                    <td className="px-6 py-5">
                      <span className="font-mono text-sm text-muted-foreground">{formatPrice(item.cost_cents)}</span>
                    </td>
                  )}
                  <td className="px-6 py-5">
                    <span className={cn(
                      "font-mono text-sm",
                      isRevenda ? "text-accent-cyan" : "text-muted-foreground"
                    )}>
                      {isRevenda ? formatPrice(item.price_cents) : '—'}
                    </span>
                  </td>
                  {/* Novas colunas Qtd Vendida e Faturamento */}
                  <td className="hidden md:table-cell px-6 py-5 text-center">
                    {isRevenda ? (
                      isLoading ? (
                        <div className="w-8 h-4 bg-white/5 animate-pulse rounded mx-auto" />
                      ) : (
                        <span className={cn(
                          "text-sm font-bold",
                          qtdVendida === 0 ? "text-white/20" : "text-white"
                        )}>
                          {qtdVendida === 0 ? '—' : qtdVendida}
                        </span>
                      )
                    ) : null}
                  </td>
                  <td className="hidden md:table-cell px-6 py-5 text-right">
                    {isRevenda ? (
                      isLoading ? (
                        <div className="w-20 h-4 bg-white/5 animate-pulse rounded ml-auto" />
                      ) : (
                        <span className={cn(
                          "text-sm font-bold font-mono",
                          faturamento === 0 ? "text-white/20" : "text-accent-cyan"
                        )}>
                          {faturamento === 0 ? '—' : formatPrice(faturamento)}
                        </span>
                      )
                    ) : null}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canManage && (
                        <button 
                          onClick={() => onEdit(item)}
                          className="p-2 text-muted-foreground hover:text-accent-cyan transition-colors rounded-lg hover:bg-white/5"
                          title="Editar"
                        >
                          <PencilSimple size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => onMove(item)}
                        className="p-2 text-muted-foreground hover:text-accent-blue transition-colors rounded-lg hover:bg-white/5"
                        title="Movimentar"
                      >
                        <ArrowsDownUp size={18} />
                      </button>
                      {canManage && (
                        <button 
                          onClick={() => onDelete(item)}
                          className="p-2 text-muted-foreground hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                          title="Deletar"
                        >
                          <Trash size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {items.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto text-muted-foreground/20">
              <Package size={32} weight="duotone" />
            </div>
            <div>
              <p className="text-white font-bold">Nenhum produto encontrado</p>
              <p className="text-sm text-muted-foreground">Tente ajustar seus filtros ou busca.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
