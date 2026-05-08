'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ComandaItem } from '../types'
import { removeComandaItem } from '../actions'
import { useTransition } from 'react'
import { toast } from 'sonner'

interface ComandaItemRowProps {
  item: ComandaItem
}

import { Scissors, Package, Trash } from '@phosphor-icons/react'

interface ComandaItemRowProps {
  item: ComandaItem
  index?: number
}

export function ComandaItemRow({ item, index = 0 }: ComandaItemRowProps) {
  const [isPending, startTransition] = useTransition()

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removeComandaItem(item.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Item removido')
      }
    })
  }

  return (
    <div 
      style={{ animationDelay: `${index * 80}ms` }}
      className="flex items-center justify-between py-5 border-b border-white/5 last:border-0 group animate-in fade-in slide-in-from-right-2 duration-500"
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg",
          item.item_type === 'service' ? "bg-accent-blue/10 text-accent-blue shadow-accent-blue/10" : "bg-accent-cyan/10 text-accent-cyan shadow-accent-cyan/10"
        )}>
          {item.item_type === 'service' ? (
            <Scissors size={20} weight="duotone" />
          ) : (
            <Package size={20} weight="duotone" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white tracking-tight group-hover:text-accent-cyan transition-colors">
            {item.name}
          </span>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            {item.quantity}x de R$ {(item.unit_price_cents / 100).toFixed(2)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className="font-bold text-white font-mono tabular-nums">
          R$ {(item.total_cents / 100).toFixed(2)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
          onClick={handleRemove}
          disabled={isPending}
        >
          <Trash size={18} weight="duotone" />
        </Button>
      </div>
    </div>
  )
}
