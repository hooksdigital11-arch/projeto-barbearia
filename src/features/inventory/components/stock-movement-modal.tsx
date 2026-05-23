'use client'

import { useState, useTransition, useEffect } from 'react'
import { ArrowsDownUp, X, CircleNotch, ArrowUp, ArrowDown, Check, CaretDown } from '@phosphor-icons/react'
import { moveStock } from '../actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import type { InventoryItem } from '../types'

export function StockMovementModal({ isOpen, onClose, product, onSuccess }: { isOpen: boolean, onClose: () => void, product: InventoryItem | null, onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [direction, setDirection] = useState<'in' | 'out'>('in')
  const [quantity, setQuantity] = useState(0)
  const [reason, setReason] = useState('')

  // Reset reason when direction or product changes
  useEffect(() => {
    if (direction === 'in') {
      setReason('Compra')
    } else {
      setReason(product?.type === 'revenda' ? 'Venda' : 'Uso')
    }
  }, [direction, product])

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
    formData.append('direction', direction)
    formData.append('quantity', String(quantity))
    formData.set('reason', reason) // Ensure the state value is used

    startTransition(async () => {
      try {
        const result = await moveStock(product.id, formData)
        
        if (result?.error) {
          throw new Error(result.error)
        }

        toast.success('MOVIMENTAÇÃO REALIZADA!')
        onSuccess?.()
        onClose()
      } catch (err) {
        const error = err as Error
        console.error('[StockMovement]', error.message)
        toast.error(`Erro: ${error.message}`)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[420px] rounded-[12px] border border-border-main bg-bg-surface overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-[24px] pb-5">
          <div className="flex items-center gap-4">
            <div className="w-[32px] h-[32px] flex items-center justify-center bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] text-text-nav shrink-0">
              <ArrowsDownUp size={18} weight="regular" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-[14px] font-medium text-text-primary uppercase tracking-tight">Movimentação</h2>
              <p className="text-[10px] text-[#383838] font-medium uppercase tracking-wide truncate max-w-[220px]">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-[26px] h-[26px] flex items-center justify-center bg-[#1a1a1a] border-[0.5px] border-[#252525] rounded-[6px] text-[#444] transition-all hover:text-text-primary"
          >
            <X size={12} weight="regular" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto px-[24px] pb-[24px]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Toggle Entrada/Saída */}
            <div className="grid grid-cols-2 gap-[6px]">
              <button
                type="button"
                onClick={() => setDirection('in')}
                className={cn(
                  "flex items-center justify-center gap-2 py-[11px] rounded-[8px] border-[0.5px] transition-all text-[11px] font-medium uppercase tracking-[0.08em]",
                  direction === 'in'
                    ? "bg-[#0d2e1a] border-[#00c07044] text-[#00c070]"
                    : "bg-bg-sidebar border-border-main text-[#444] hover:border-[#333]"
                )}
              >
                <ArrowUp size={14} weight="bold" />
                Entrada
              </button>
              <button
                type="button"
                onClick={() => setDirection('out')}
                className={cn(
                  "flex items-center justify-center gap-2 py-[11px] rounded-[8px] border-[0.5px] transition-all text-[11px] font-medium uppercase tracking-[0.08em]",
                  direction === 'out'
                    ? "bg-[#2e1a0d] border-[#c0700044] text-[#c07000]"
                    : "bg-bg-sidebar border-border-main text-[#444] hover:border-[#333]"
                )}
              >
                <ArrowDown size={14} weight="bold" />
                Saída
              </button>
            </div>

            {/* Preview Atual / Após */}
            <div className="grid grid-cols-2 bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] overflow-hidden">
              <div className="p-[12px] text-center border-r-[0.5px] border-border-main">
                <p className="text-[8px] font-medium text-[#2a2a2a] uppercase tracking-[0.12em] mb-1">Atual</p>
                <p className="text-[20px] font-medium text-text-primary tabular-nums">{product.quantity ?? 0}</p>
              </div>
              <div className="p-[12px] text-center">
                <p className="text-[8px] font-medium text-[#2a2a2a] uppercase tracking-[0.12em] mb-1">Após</p>
                <p className={cn(
                  "text-[20px] font-medium tabular-nums",
                  newQuantity < 0 ? "text-red-500" : "text-text-primary"
                )}>{newQuantity}</p>
              </div>
            </div>

            {/* Quantidade */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Quantidade</label>
              <input
                type="number"
                min={1}
                value={quantity || ''}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20"
                placeholder="0"
              />
            </div>

            {/* Motivo */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Motivo</label>
              <div className="relative">
                <select 
                  name="reason" 
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full appearance-none bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] pr-[30px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 uppercase cursor-pointer"
                >
                  {direction === 'in' ? (
                    <>
                      <option value="Compra">COMPRA</option>
                      <option value="Devolução">DEVOLUÇÃO</option>
                      <option value="Ajuste">AJUSTE DE SALDO</option>
                      <option value="Doação">DOAÇÃO RECEBIDA</option>
                    </>
                  ) : (
                    <>
                      <option value="Venda">VENDA</option>
                      <option value="Uso">USO INTERNO</option>
                      <option value="Perda">PERDA / QUEBRA</option>
                      <option value="Vencido">PRODUTO VENCIDO</option>
                      <option value="Ajuste">AJUSTE DE SALDO</option>
                    </>
                  )}
                </select>
                <div className="absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none text-[#333]">
                  <CaretDown size={14} weight="regular" />
                </div>
              </div>
            </div>

            {/* Observação */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Observação (Opcional)</label>
              <textarea 
                name="observation" 
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 resize-none h-[60px] uppercase placeholder:text-[#222]"
                placeholder="DETALHES ADICIONAIS..."
              />
            </div>

            {/* Footer Actions */}
            <div className="grid grid-cols-2 gap-[10px] pt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-bg-sidebar border-[0.5px] border-border-main text-[#444] py-[12px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:border-[#333] hover:text-[#777]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center justify-center gap-2 bg-accent-main text-black py-[12px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:opacity-90 disabled:opacity-40"
              >
                {isPending ? (
                  <CircleNotch size={14} className="animate-spin" />
                ) : (
                  <Check size={14} weight="bold" />
                )}
                CONFIRMAR
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
