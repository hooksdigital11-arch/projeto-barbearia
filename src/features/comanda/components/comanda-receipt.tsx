'use client'

import { Printer, Share2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ComandaItem } from '../types'

interface ComandaReceiptProps {
  receiptNumber: string
  items: ComandaItem[]
  totalCents: number
  paymentMethod: string
  onClose: () => void
}

export function ComandaReceipt({
  receiptNumber,
  items,
  totalCents,
  paymentMethod,
  onClose,
}: ComandaReceiptProps) {
  const methodMap: Record<string, string> = {
    cash: 'Dinheiro',
    pix: 'PIX',
    credit_card: 'Crédito',
    debit_card: 'Débito',
  }

  return (
    <Card className="bg-bg-surface border-white/10 overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-success/10 p-6 flex flex-col items-center justify-center text-center border-b border-white/5">
          <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mb-3">
            <Check className="w-6 h-6 text-success" />
          </div>
          <h2 className="text-xl font-bold text-text-primary uppercase tracking-wider">PAGAMENTO CONFIRMADO!</h2>
        </div>

        <div className="p-8 space-y-6 font-mono text-sm uppercase">
          <div className="text-center space-y-1">
            <div className="text-lg font-bold border-y border-dashed border-white/20 py-2">BARBEARIA DEMO</div>
            <div className="text-muted-foreground pt-2">Recibo {receiptNumber}</div>
            <div className="text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="space-y-3 py-4 border-y border-dashed border-white/20">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name}</span>
                <span>R$ {(item.total_cents / 100).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-lg font-bold">
            <div className="flex justify-between">
              <span>TOTAL:</span>
              <span className="text-accent">R$ {(totalCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-normal text-muted-foreground">
              <span>PAGAMENTO:</span>
              <span className="flex items-center gap-1">
                {methodMap[paymentMethod]} <Check className="w-3 h-3 text-success" />
              </span>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-3 gap-3">
            <Button variant="secondary" className="flex flex-col h-auto py-3 gap-1">
              <Printer className="w-4 h-4" />
              <span className="text-[10px]">IMPRIMIR</span>
            </Button>
            <Button variant="secondary" className="flex flex-col h-auto py-3 gap-1">
              <Share2 className="w-4 h-4" />
              <span className="text-[10px]">WHATSAPP</span>
            </Button>
            <Button variant="cyan" className="flex flex-col h-auto py-3 gap-1" onClick={onClose}>
              <Check className="w-4 h-4" />
              <span className="text-[10px]">FECHAR</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
