'use client'

import { useState, useTransition } from 'react'
import { ArrowsDownUp, X, CircleNotch, ArrowUp, ArrowDown, FloppyDisk } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { moveStock } from '../actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { useInventoryMovements } from '@/hooks/use-inventory-movements'
import { createClient } from '@/lib/supabase/client'
import type { InventoryItem } from '../types'

export function StockMovementModal({ isOpen, onClose, product, onSuccess }: { isOpen: boolean, onClose: () => void, product: InventoryItem | null, onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [direction, setDirection] = useState<'in' | 'out'>('in')
  const [quantity, setQuantity] = useState(0)
  
  const { registerMovement } = useInventoryMovements()
  const supabase = createClient()

  if (!isOpen || !product) return null

  const newQuantity = direction === 'in' ? (product.quantity ?? 0) + quantity : (product.quantity ?? 0) - quantity

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!product) return
    if (quantity <= 0) {
      toast.error('A quantidade deve ser maior que zero.')
      return
    }
    if (direction === 'out' && newQuantity < 0) {
      toast.error('Estoque insuficiente para essa saída.')
      return
    }

    const formData = new FormData(e.currentTarget)
    const reason = formData.get('reason') as string
    const notes = formData.get('observation') as string
    
    startTransition(async () => {
      try {
        // Executar em paralelo: atualizar estoque e registrar movimentação
        const promises = []

        // 1. Debitar/Creditar estoque
        promises.push(
          supabase
            .from('inventory')
            .update({ quantity: newQuantity })
            .eq('id', product.id)
        )

        // 2. Registrar movimentação
        promises.push(
          registerMovement({
            organization_id: product.organization_id,
            inventory_id: product.id,
            type: direction === 'out' 
              ? (product.type === 'revenda' ? 'venda' : 'uso_interno') 
              : (reason === 'Compra' ? 'entrada' : 'ajuste'),
            quantity: quantity,
            unit_price_cents: (direction === 'out' && product.type === 'revenda') ? product.price_cents : null,
            notes: notes
          })
        )

        const results = await Promise.all(promises)
        const updateError = (results[0] as any).error
        if (updateError) throw new Error(updateError.message)

        toast.success('Estoque atualizado com sucesso!')
        onSuccess?.()
        onClose()
      } catch (err: any) {
        console.error('[StockMovement]', err.message)
        toast.error(`Erro: ${err.message}`)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#141414] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
              <ArrowsDownUp size={28} weight="duotone" />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-syne text-white">Movimentação</h3>
              <p className="text-sm text-muted-foreground">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-white transition-colors rounded-xl hover:bg-white/5">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setDirection('in')}
              className={cn(
                "flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all font-bold uppercase tracking-widest text-xs",
                direction === 'in' 
                  ? "bg-green-500/10 border-green-500/50 text-green-400" 
                  : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
              )}
            >
              <ArrowUp size={18} weight="bold" />
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setDirection('out')}
              className={cn(
                "flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all font-bold uppercase tracking-widest text-xs",
                direction === 'out' 
                  ? "bg-red-500/10 border-red-500/50 text-red-400" 
                  : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
              )}
            >
              <ArrowDown size={18} weight="bold" />
              Saída
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quantidade</label>
              <Input 
                type="number" 
                min={1}
                value={quantity || ''}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="bg-white/5 border-white/10 rounded-xl py-6 text-xl font-bold text-center" 
              />
            </div>

            <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Atual</p>
                <p className="text-xl font-bold text-white">{product.quantity ?? 0}</p>
              </div>
              <div className="text-center border-l border-white/5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Após</p>
                <p className={cn(
                  "text-xl font-bold",
                  newQuantity < 0 ? "text-red-500" : "text-accent-cyan"
                )}>{newQuantity}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Motivo</label>
                {direction === 'out' && (
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider",
                    product.type === 'revenda' 
                      ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20" 
                      : "bg-white/10 text-muted-foreground border border-white/10"
                  )}>
                    {product.type === 'revenda' ? 'Venda' : 'Uso Interno'}
                  </span>
                )}
              </div>
              
              <select 
                name="reason" 
                required
                disabled={direction === 'out'}
                value={direction === 'out' ? (product.type === 'revenda' ? 'Venda' : 'Uso') : undefined}
                className={cn(
                  "w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all appearance-none",
                  direction === 'out' && "opacity-80 cursor-not-allowed"
                )}
              >
                {direction === 'in' ? (
                  <>
                    <option value="Compra">Compra</option>
                    <option value="Devolução">Devolução</option>
                    <option value="Ajuste">Ajuste de Saldo</option>
                    <option value="Doação">Doação Recebida</option>
                  </>
                ) : (
                  <>
                    <option value="Venda">Venda</option>
                    <option value="Uso">Uso Interno</option>
                    <option value="Perda">Perda / Quebra</option>
                    <option value="Vencido">Produto Vencido</option>
                    <option value="Ajuste">Ajuste de Saldo</option>
                  </>
                )}
              </select>
              {direction === 'out' && (
                <input type="hidden" name="reason" value={product.type === 'revenda' ? 'Venda' : 'Uso'} />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Observação (Opcional)</label>
              <textarea 
                name="observation" 
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all outline-none resize-none"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex gap-4">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-2xl py-6 text-muted-foreground hover:text-white hover:bg-white/5">
              Cancelar
            </Button>
            <Button disabled={isPending} type="submit" className="flex-1 bg-accent-blue hover:bg-blue-400 text-black font-bold gap-2 rounded-2xl py-6 text-base shadow-lg shadow-blue-500/20">
              {isPending ? <CircleNotch size={24} className="animate-spin" /> : <FloppyDisk size={24} />}
              Confirmar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
