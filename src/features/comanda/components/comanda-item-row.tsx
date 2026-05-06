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

export function ComandaItemRow({ item }: ComandaItemRowProps) {
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
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group">
      <div className="flex flex-col">
        <span className="font-medium text-white flex items-center gap-2">
          {item.item_type === 'service' ? '✂️' : '🧴'} {item.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {item.quantity}x de R$ {(item.unit_price_cents / 100).toFixed(2)}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-semibold text-white">
          R$ {(item.total_cents / 100).toFixed(2)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleRemove}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
