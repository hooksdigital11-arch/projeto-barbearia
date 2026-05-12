'use client'

import { useState, useEffect, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { addComandaItem } from '../actions'
import { createClient } from '@/lib/supabase/client'

export function AddProductModal({ isOpen, onClose, clientId, appointmentId, onAdded }: any) {
  const [products, setProducts] = useState<any[]>([])
  const [isPending, startTransition] = useTransition()
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      supabase.from('inventory').select('*').eq('active', true).gt('quantity', 0).then(({ data }) => {
        if (data) setProducts(data)
      })
    }
  }, [isOpen])

  const handleAdd = (product: any) => {
    startTransition(async () => {
      const quantity = quantities[product.id] || 1
      const formData = new FormData()
      formData.append('client_id', clientId)
      if (appointmentId) formData.append('appointment_id', appointmentId)
      formData.append('item_type', 'product')
      formData.append('name', product.name)
      formData.append('quantity', quantity.toString())
      formData.append('unit_price_cents', (product.price_cents || 0).toString())
      formData.append('inventory_id', product.id)

      const res = await addComandaItem(formData)
      if (res.success) {
        toast.success('Produto adicionado')
        onAdded()
        onClose()
      } else {
        toast.error(res.error || 'Erro')
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-bg-surface border-white/10 max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-syne uppercase tracking-tight text-text-primary">Adicionar Produto</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
          {products.map(product => (
            <div 
              key={product.id} 
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all gap-4 group"
            >
              <div>
                <p className="font-bold text-text-primary uppercase text-sm tracking-wide">{product.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Estoque: <span className={product.quantity <= 5 ? 'text-error font-bold' : 'text-success'}>{product.quantity} unid.</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-accent whitespace-nowrap">R$ {((product.price_cents || 0) / 100).toFixed(2)}</span>
                <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
                  <Input 
                    type="number" 
                    min="1" 
                    max={product.quantity} 
                    value={quantities[product.id] || 1}
                    onChange={(e) => setQuantities({ ...quantities, [product.id]: parseInt(e.target.value) || 1 })}
                    className="w-16 h-8 bg-transparent border-0 focus-visible:ring-0 text-center text-text-primary"
                  />
                </div>
                <Button 
                  size="sm" 
                  variant="cyan"
                  className="h-9 px-4 font-bold text-[10px]" 
                  onClick={() => handleAdd(product)}
                  disabled={isPending}
                >
                  ADICIONAR
                </Button>
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="text-center text-muted-foreground py-12">Nenhum produto disponível em estoque.</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
