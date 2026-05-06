'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { closeComanda } from '../actions'
import { Banknote, CreditCard, QrCode, Wallet } from 'lucide-react'

const METHODS = [
  { id: 'pix', label: 'PIX', icon: QrCode },
  { id: 'credit_card', label: 'Crédito', icon: CreditCard },
  { id: 'debit_card', label: 'Débito', icon: Wallet },
  { id: 'cash', label: 'Dinheiro', icon: Banknote },
]

export function PaymentModal({ isOpen, onClose, clientId, appointmentId, subtotal, onSuccess }: any) {
  const [method, setMethod] = useState<string>('')
  const [discount, setDiscount] = useState('0')
  const [isPending, startTransition] = useTransition()

  const discountCents = Math.round(parseFloat(discount || '0') * 100)
  const total = Math.max(0, subtotal - discountCents)

  const handleConfirm = () => {
    if (!method) {
      toast.error('Selecione uma forma de pagamento')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('client_id', clientId)
      if (appointmentId) formData.append('appointment_id', appointmentId)
      formData.append('payment_method', method)
      formData.append('discount_cents', discountCents.toString())

      const res = await closeComanda(formData)
      if (res.success) {
        toast.success('Pagamento confirmado!')
        onSuccess(res)
      } else {
        toast.error(res.error || 'Erro ao processar pagamento')
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#141414] border-white/10 sm:max-w-md p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <DialogHeader>
            <DialogTitle className="font-syne uppercase tracking-tight text-white text-center">Fechar Comanda</DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-8">
          <div className="bg-black/20 rounded-2xl p-6 text-center border border-white/5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total a cobrar</p>
            <p className="text-5xl font-bold text-accent tracking-tighter">
              <span className="text-lg mr-1 opacity-50">R$</span>
              {(total / 100).toFixed(2)}
            </p>
            {discountCents > 0 && (
              <p className="text-xs line-through text-muted-foreground mt-1 opacity-50">R$ {(subtotal / 100).toFixed(2)}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Forma de pagamento</Label>
            <div className="grid grid-cols-2 gap-3">
              {METHODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex flex-col items-center justify-center p-4 border rounded-2xl transition-all duration-300 relative group ${
                    method === m.id 
                      ? 'border-accent bg-accent/10 text-accent' 
                      : 'border-white/5 bg-white/2 text-muted-foreground hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <m.icon className={`w-6 h-6 mb-2 transition-transform duration-300 ${method === m.id ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="font-bold text-[10px] uppercase tracking-wide">{m.label}</span>
                  {method === m.id && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="discount" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Desconto Opcional (R$)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
              <Input 
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                placeholder="0.00"
                className="bg-white/5 border-white/10 pl-9 focus-visible:ring-accent/50 h-11"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="ghost" className="flex-1 h-12 text-muted-foreground hover:text-white" onClick={onClose} disabled={isPending}>
              CANCELAR
            </Button>
            <Button 
              variant="cyan"
              className="flex-[2] h-12 font-bold uppercase tracking-widest" 
              onClick={handleConfirm} 
              disabled={isPending || !method}
            >
              {isPending ? 'PROCESSANDO...' : 'CONFIRMAR PAGAMENTO'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
