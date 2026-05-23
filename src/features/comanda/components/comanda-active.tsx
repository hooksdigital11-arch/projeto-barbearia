'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, Receipt } from 'lucide-react'
import { AddServiceModal } from './add-service-modal'
import { AddProductModal } from './add-product-modal'
import { PaymentModal } from './payment-modal'
import { ComandaItemRow } from './comanda-item-row'
import { ComandaReceipt } from './comanda-receipt'
import { ComandaItem } from '../types'

interface ComandaActiveProps {
  clientId: string
  clientName: string
  items: ComandaItem[]
  appointment?: { id: string; service?: { name: string }; start_time: string } | null
  onBack: () => void
  onRefresh: () => void
}

export function ComandaActive({
  clientId,
  clientName,
  items,
  appointment,
  onBack,
  onRefresh,
}: ComandaActiveProps) {
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  interface ReceiptData {
    receiptNumber: string
    items: ComandaItem[]
    totalCents: number
    paymentMethod: string
  }
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)

  const subtotal = items.reduce((acc, item) => acc + item.total_cents, 0)
  const discount = 0 // Implementar lógica de desconto se houver no futuro
  const total = subtotal - discount

  if (receiptData) {
    return (
      <ComandaReceipt 
        {...receiptData} 
        onClose={() => {
          setReceiptData(null)
          onBack()
        }} 
      />
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-8 h-8 rounded-[8px] bg-[#141414] border border-[#1e1e1e] flex items-center justify-center text-[#555] hover:text-[#888] active:scale-95 transition-all shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.14em] mb-[4px]">CHECKOUT</p>
          <h1 className="text-[24px] font-medium text-[#fff] tracking-[-0.01em] uppercase leading-none">
            Comanda Digital
          </h1>
        </div>
      </div>

      {/* Cartão do Cliente */}
      <div className="p-5 rounded-[10px] border border-[#1a1a1a] bg-[#0f0f0f] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-accent-main/10 rounded-[8px] flex items-center justify-center text-accent-main text-lg font-bold border border-accent-main/15">
            {clientName[0]?.toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 className="text-[18px] font-bold text-text-primary tracking-tight uppercase">{clientName}</h2>
            {appointment && (
              <div className="flex items-center gap-2 text-muted-foreground font-medium text-[10px]">
                <span className="text-accent-main uppercase tracking-wider font-semibold">{appointment.service?.name}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="uppercase tracking-wider">{new Date(appointment.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-[6px] bg-black/40 border border-white/5 text-[9px] font-medium uppercase tracking-wider text-accent-main flex items-center gap-2 w-fit">
          <div className="w-1.5 h-1.5 bg-accent-main rounded-full animate-pulse" />
          Sessão Ativa: {Math.floor((Date.now() - new Date(items[0]?.created_at || Date.now()).getTime()) / 60000)}m
        </div>
      </div>

      {/* Interface de Itens e Recibo */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-6 items-start">
        {/* Lado Esquerdo: Lista de Itens */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[9px] font-semibold text-[#333] uppercase tracking-wider">Composição da Comanda</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsServiceModalOpen(true)}
                className="px-4 py-2 rounded-[8px] bg-white/5 border border-white/10 text-[10px] font-semibold tracking-wider hover:bg-white/10 active:scale-95 transition-all text-text-primary uppercase flex items-center gap-1.5"
              >
                <Plus size={12} className="text-accent-main" /> Serviço
              </button>
              <button 
                onClick={() => setIsProductModalOpen(true)}
                className="px-4 py-2 rounded-[8px] bg-white/5 border border-white/10 text-[10px] font-semibold tracking-wider hover:bg-white/10 active:scale-95 transition-all text-text-primary uppercase flex items-center gap-1.5"
              >
                <Plus size={12} className="text-accent-main" /> Produto
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {items.length > 0 ? (
              items.map((item, idx) => (
                <ComandaItemRow key={item.id} item={item} index={idx} />
              ))
            ) : (
              <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] min-h-[220px] flex flex-col items-center justify-center p-8 gap-3">
                <Receipt className="w-8 h-8 text-[#1e1e1e]" />
                <p className="text-[10px] font-medium text-[#333] uppercase tracking-wider">Aguardando lançamento de itens</p>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Resumo Financeiro (Recibo) */}
        <div className="sticky top-8">
          <div className="p-6 rounded-[10px] bg-[#0f0f0f] border border-[#1a1a1a] flex flex-col space-y-6">
            <div className="text-center space-y-1">
              <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Resumo de Pagamento</h4>
              <div className="w-8 h-[1px] bg-white/10 mx-auto" />
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center text-[11px] uppercase tracking-wider">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold text-text-primary font-mono">R$ {(subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] uppercase tracking-wider">
                <span className="text-muted-foreground">Descontos</span>
                <span className="font-bold text-red-500 font-mono">- R$ {(discount / 100).toFixed(2)}</span>
              </div>
              
              <div className="pt-6 border-t border-dashed border-white/10">
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-[9px] font-medium text-accent-main uppercase tracking-wider">Total a Pagar</span>
                  <span className="text-4xl font-bold text-text-primary font-mono tracking-tight">
                    R$ {(total / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <button 
                className="w-full py-3 rounded-[8px] bg-accent-main text-black font-semibold text-[11px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => setIsPaymentModalOpen(true)}
                disabled={items.length === 0}
              >
                Finalizar Checkout
              </button>
              
              <button 
                onClick={onBack}
                className="w-full py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-widest hover:text-text-primary transition-colors text-center"
              >
                Manter em Aberto
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        clientId={clientId}
        appointmentId={appointment?.id ?? null}
        onAdded={onRefresh}
      />

      <AddProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        clientId={clientId}
        appointmentId={appointment?.id ?? null}
        onAdded={onRefresh}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        clientId={clientId}
        appointmentId={appointment?.id ?? null}
        subtotal={subtotal}
        onSuccess={(data: ReceiptData) => setReceiptData(data)}
      />
    </div>
  )
}
