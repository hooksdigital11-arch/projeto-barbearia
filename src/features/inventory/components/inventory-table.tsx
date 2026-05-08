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
    <div className="bg-bg-secondary/50 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.03] border-b border-white/5">
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">Produto</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">Tipo</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 text-center">Estoque</th>
              {showCost && <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">Custo</th>}
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">Preço Venda</th>
              <th className="hidden md:table-cell px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 text-center">Qtd Vendida</th>
              <th className="hidden md:table-cell px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 text-right">Faturamento</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((item, index) => {
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
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={cn(
                    "hover:bg-white/[0.03] transition-all duration-300 group animate-in slide-in-from-bottom-2 fade-in",
                    isOut ? "bg-red-500/[0.02]" : 
                    isLowStock ? "bg-amber-500/[0.02]" : ""
                  )}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg",
                        isOut ? "bg-red-500/20 text-red-400 shadow-red-500/10" :
                        isLowStock ? "bg-amber-500/20 text-amber-400 shadow-amber-500/10" : "bg-accent-blue/10 text-accent-blue shadow-accent-blue/10"
                      )}>
                        <Package size={22} weight="duotone" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm tracking-tight group-hover:text-accent-cyan transition-colors">{item.name}</p>
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{item.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "text-[10px] px-3 py-1 rounded-xl font-black uppercase tracking-widest border transition-all",
                      isRevenda 
                        ? "bg-green-500/10 text-green-400 border-green-500/20 group-hover:bg-green-500/20" 
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20 group-hover:bg-blue-500/20"
                    )}>
                      {isRevenda ? 'Revenda' : 'Uso Interno'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "px-3 py-1 rounded-xl font-bold text-sm flex items-center gap-2",
                        isOut ? "bg-red-500/10 text-red-400" : 
                        isLowStock ? "bg-amber-500/10 text-amber-400" : "text-white"
                      )}>
                        {item.quantity}
                        {isOut ? <MinusCircle size={16} weight="fill" className="animate-pulse" /> : 
                         isLowStock ? <Warning size={16} weight="fill" className="animate-bounce" /> : null}
                      </div>
                    </div>
                  </td>
                  {showCost && (
                    <td className="px-6 py-5">
                      <span className="font-mono text-sm text-muted-foreground/80">{formatPrice(item.cost_cents)}</span>
                    </td>
                  )}
                  <td className="px-6 py-5">
                    <span className={cn(
                      "font-mono text-sm font-bold",
                      isRevenda ? "text-accent-cyan" : "text-muted-foreground/60"
                    )}>
                      {isRevenda ? formatPrice(item.price_cents) : '—'}
                    </span>
                  </td>
                  
                  <td className="hidden md:table-cell px-6 py-5 text-center">
                    {isRevenda ? (
                      isLoading ? (
                        <div className="w-8 h-4 bg-white/5 animate-pulse rounded mx-auto" />
                      ) : (
                        <span className={cn(
                          "text-sm font-black",
                          qtdVendida === 0 ? "text-white/10" : "text-white"
                        )}>
                          {qtdVendida === 0 ? '—' : qtdVendida}
                        </span>
                      )
                    ) : (
                      <span className="text-white/5">—</span>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-6 py-5 text-right">
                    {isRevenda ? (
                      isLoading ? (
                        <div className="w-20 h-4 bg-white/5 animate-pulse rounded ml-auto" />
                      ) : (
                        <span className={cn(
                          "text-sm font-black font-mono",
                          faturamento === 0 ? "text-white/10" : "text-accent-cyan"
                        )}>
                          {faturamento === 0 ? '—' : formatPrice(faturamento)}
                        </span>
                      )
                    ) : (
                      <span className="text-white/5">—</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canManage && (
                        <button 
                          onClick={() => onEdit(item)}
                          className="p-3 text-muted-foreground hover:text-accent-cyan transition-all rounded-2xl hover:bg-accent-cyan/10 active:scale-90"
                          title="Editar"
                        >
                          <PencilSimple size={20} weight="duotone" />
                        </button>
                      )}
                      <button 
                        onClick={() => onMove(item)}
                        className="p-3 text-muted-foreground hover:text-accent-blue transition-all rounded-2xl hover:bg-accent-blue/10 active:scale-90"
                        title="Movimentar"
                      >
                        <ArrowsDownUp size={20} weight="duotone" />
                      </button>
                      {canManage && (
                        <button 
                          onClick={() => onDelete(item)}
                          className="p-3 text-muted-foreground hover:text-red-400 transition-all rounded-2xl hover:bg-red-500/10 active:scale-90"
                          title="Deletar"
                        >
                          <Trash size={20} weight="duotone" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {items.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto text-muted-foreground/20">
              <Package size={32} weight="duotone" />
            </div>
            <div>
              <p className="text-white font-bold">Nenhum produto encontrado</p>
              <p className="text-sm text-muted-foreground">Tente ajustar seus filtros ou busca.</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
