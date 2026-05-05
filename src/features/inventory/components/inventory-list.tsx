'use client'

import { Package, Plus, DotsThreeVertical, Warning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { InventoryItem } from '../types'

interface InventoryListProps {
  items: InventoryItem[]
}

export function InventoryList({ items }: InventoryListProps) {
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-syne text-white">Estoque</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus produtos e suprimentos</p>
        </div>
        <Button className="bg-accent-cyan hover:bg-cyan-400 text-black font-bold gap-2 rounded-2xl px-6 py-6 text-base">
          <Plus size={20} weight="bold" />
          Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total de Itens</p>
          <p className="text-3xl font-bold text-white font-syne">{items.length}</p>
        </div>
        <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 space-y-2">
          <p className="text-xs font-bold text-amber-400/60 uppercase tracking-widest">Estoque Baixo</p>
          <p className="text-3xl font-bold text-amber-400 font-syne">
            {items.filter(i => i.quantity <= i.min_quantity).length}
          </p>
        </div>
        <div className="p-6 rounded-[2rem] bg-accent-cyan/5 border border-accent-cyan/10 space-y-2">
          <p className="text-xs font-bold text-accent-cyan/60 uppercase tracking-widest">Valor em Estoque</p>
          <p className="text-3xl font-bold text-accent-cyan font-syne">
            {formatPrice(items.reduce((acc, curr) => acc + (curr.price_cents * curr.quantity), 0))}
          </p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Produto</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Categoria</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">Quantidade</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Preço Unit.</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                      <Package size={20} weight="duotone" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{item.name}</p>
                      {item.quantity <= item.min_quantity && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold uppercase mt-0.5">
                          <Warning size={12} weight="fill" />
                          Estoque Baixo
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <p className={cn(
                    "font-bold text-sm",
                    item.quantity <= item.min_quantity ? "text-amber-400" : "text-white"
                  )}>
                    {item.quantity} <span className="text-[10px] text-muted-foreground font-normal uppercase ml-1">{item.unit}</span>
                  </p>
                </td>
                <td className="px-6 py-5">
                  <span className="font-mono text-sm text-accent-cyan">{formatPrice(item.price_cents)}</span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/5">
                    <DotsThreeVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {items.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto text-muted-foreground/20">
              <Package size={32} weight="duotone" />
            </div>
            <div>
              <p className="text-white font-bold">Nenhum produto cadastrado</p>
              <p className="text-sm text-muted-foreground">Comece adicionando seu primeiro item ao estoque.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
