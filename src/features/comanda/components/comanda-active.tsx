'use client'

import { useState, useEffect, useTransition } from 'react'
import { ArrowLeft, Plus, Receipt, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AddServiceModal } from './add-service-modal'
import { AddProductModal } from './add-product-modal'
import { PaymentModal } from './payment-modal'
import { ComandaItemRow } from './comanda-item-row'
import { ComandaReceipt } from './comanda-receipt'
import { ComandaItem } from '../types'
import { addComandaItem } from '../actions'
import { toast } from 'sonner'

interface ComandaActiveProps {
  clientId: string
  clientName: string
  items: ComandaItem[]
  appointment?: any
  onBack: () => void
}

export function ComandaActive({
  clientId,
  clientName,
  items,
  appointment,
  onBack,
}: ComandaActiveProps) {
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)
  const [isPending, startTransition] = useTransition()

  // Calcular totais
  const subtotal = items.reduce((sum, item) => sum + item.total_cents, 0)
  const discount = 0 // Implementado no PaymentModal
  const total = subtotal - discount

  // Pre-load logic: Se não houver itens e houver um agendamento, adiciona o serviço automaticamente
  useEffect(() => {
    if (items.length === 0 && appointment && appointment.status !== 'completed') {
      const initComanda = async () => {
        const formData = new FormData()
        formData.append('client_id', clientId)
        formData.append('appointment_id', appointment.id)
        formData.append('item_type', 'service')
        formData.append('name', appointment.service?.name || 'Serviço Agendado')
        formData.append('quantity', '1')
        formData.append('unit_price_cents', String(appointment.price_cents))
        
        await addComandaItem(formData)
      }
      startTransition(initComanda)
    }
  }, [items.length, appointment, clientId])

  if (receiptData) {
    return (
      <div className="max-w-md mx-auto py-8">
        <ComandaReceipt
          receiptNumber={receiptData.receiptNumber}
          items={receiptData.items}
          totalCents={receiptData.totalCents}
          paymentMethod={receiptData.paymentMethod}
          onClose={onBack}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold font-syne text-white uppercase tracking-tight">Comanda Digital</h1>
      </div>

      <Card className="bg-[#141414] border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold">
                  {clientName[0]}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white uppercase">{clientName}</h2>
                  {appointment && (
                    <p className="text-sm text-muted-foreground">
                      Agendamento: {new Date(appointment.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {appointment.service?.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-accent" />
              Aberta há {Math.floor((Date.now() - new Date(items[0]?.created_at || Date.now()).getTime()) / 60000)} min
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Itens da Comanda</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="h-8 gap-1" onClick={() => setIsServiceModalOpen(true)}>
              <Plus className="w-3 h-3" /> SERVIÇO
            </Button>
            <Button size="sm" variant="secondary" className="h-8 gap-1" onClick={() => setIsProductModalOpen(true)}>
              <Plus className="w-3 h-3" /> PRODUTO
            </Button>
          </div>
        </div>

        <div className="bg-[#141414] rounded-xl border border-white/5 p-4 min-h-[200px] flex flex-col">
          {items.length > 0 ? (
            <div className="flex-1 divide-y divide-white/5">
              {items.map((item) => (
                <ComandaItemRow key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2 py-12">
              <Receipt className="w-8 h-8 opacity-20" />
              <p className="text-sm">Nenhum item adicionado.</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t-2 border-dashed border-white/10 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>SUBTOTAL:</span>
              <span>R$ {(subtotal / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>DESCONTO:</span>
              <span>R$ {(discount / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-white pt-2">
              <span>TOTAL:</span>
              <span className="text-accent">R$ {(total / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="outline" className="flex-1 border-error/20 text-error hover:bg-error/10 hover:text-error" onClick={onBack}>
          CANCELAR
        </Button>
        <Button 
          variant="cyan" 
          className="flex-[2] font-bold text-sm h-12" 
          onClick={() => setIsPaymentModalOpen(true)}
          disabled={items.length === 0}
        >
          FECHAR E COBRAR <ArrowLeft className="w-4 h-4 rotate-180 ml-2" />
        </Button>
      </div>

      <AddServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        clientId={clientId}
        appointmentId={appointment?.id}
      />

      <AddProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        clientId={clientId}
        appointmentId={appointment?.id}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        clientId={clientId}
        appointmentId={appointment?.id}
        subtotal={subtotal}
        onSuccess={(data: any) => setReceiptData(data)}
      />
    </div>
  )
}
