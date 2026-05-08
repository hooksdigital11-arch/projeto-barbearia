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

import { cn } from '@/lib/utils/cn'

export function ComandaActive({
  clientId,
  clientName,
  items,
  appointment,
  onBack,
}: ComandaActiveProps) {
  // ... (hooks e lógica existentes mantidos)

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-10 duration-1000 ease-out">
      {/* Header com Design Assimétrico */}
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="w-14 h-14 rounded-2xl hover:bg-white/5 active:scale-90 transition-all border border-white/5"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 bg-accent-cyan rounded-full shadow-[0_0_20px_rgba(0,229,255,0.4)]" />
            <h1 className="text-4xl font-black font-syne text-white uppercase tracking-tighter">
              Checkout<span className="text-accent-cyan">.</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Cartão do Cliente Pro Max */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-cyan/20 to-transparent rounded-[2.5rem] blur opacity-50 transition-opacity" />
        <div className="relative p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-accent-cyan/10 rounded-[2rem] flex items-center justify-center text-accent-cyan text-3xl font-black border border-accent-cyan/20 shadow-inner">
                {clientName[0]}
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-white tracking-tighter">{clientName}</h2>
                {appointment && (
                  <div className="flex items-center gap-3 text-muted-foreground font-medium bg-white/5 px-4 py-1.5 rounded-full border border-white/5 w-fit">
                    <span className="text-accent-cyan text-xs font-black uppercase tracking-widest">{appointment.service?.name}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span className="text-xs uppercase tracking-widest">{new Date(appointment.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-3 rounded-2xl bg-black/40 border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan flex items-center gap-3 shadow-2xl">
              <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse shadow-[0_0_10px_rgba(0,229,255,1)]" />
              Sessão Ativa: {Math.floor((Date.now() - new Date(items[0]?.created_at || Date.now()).getTime()) / 60000)}m
            </div>
          </div>
          {/* Decoração de fundo */}
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-1000">
            <Receipt size={240} weight="duotone" />
          </div>
        </div>
      </div>

      {/* Interface de Itens e Recibo */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-12 items-start">
        {/* Lado Esquerdo: Lista de Itens */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Composição da Comanda</h3>
            <div className="flex gap-4">
              <Button 
                onClick={() => setIsServiceModalOpen(true)}
                className="h-12 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] tracking-widest hover:bg-white/10 active:scale-95 transition-all"
              >
                <Plus size={16} weight="bold" className="mr-2 text-accent-cyan" /> SERVIÇO
              </Button>
              <Button 
                onClick={() => setIsProductModalOpen(true)}
                className="h-12 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] tracking-widest hover:bg-white/10 active:scale-95 transition-all"
              >
                <Plus size={16} weight="bold" className="mr-2 text-accent-blue" /> PRODUTO
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {items.length > 0 ? (
              items.map((item, idx) => (
                <ComandaItemRow key={item.id} item={item} index={idx} />
              ))
            ) : (
              <div className="p-20 rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-muted-foreground gap-6 bg-white/[0.01]">
                <div className="w-24 h-24 rounded-[2rem] bg-white/[0.03] flex items-center justify-center text-white/5">
                  <Receipt size={48} weight="duotone" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Aguardando lançamento de itens</p>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Resumo Financeiro (Recibo) */}
        <div className="sticky top-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-accent-cyan/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-1000" />
            <div className="relative p-10 rounded-[3rem] bg-[#141414] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-cyan animate-gradient-x" />
              
              <div className="mb-10 text-center space-y-2">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Resumo de Pagamento</h4>
                <div className="w-12 h-1 bg-white/10 mx-auto rounded-full" />
              </div>

              <div className="space-y-6 flex-1">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Subtotal</span>
                  <span className="text-lg font-bold text-white tabular-nums">R$ {(subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Descontos</span>
                  <span className="text-lg font-bold text-red-500 tabular-nums">- R$ {(discount / 100).toFixed(2)}</span>
                </div>
                
                <div className="pt-8 mt-4 border-t-2 border-dashed border-white/10">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-accent-cyan uppercase tracking-[0.4em] text-center">Total a Pagar</span>
                    <span className="text-6xl font-black text-white text-center font-syne tracking-tighter shadow-glow-cyan">
                      R$ {(total / 100).toFixed(0)}<span className="text-2xl">,{(total % 100).toString().padStart(2, '0')}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-12 space-y-4">
                <Button 
                  variant="cyan" 
                  className="w-full h-20 rounded-[2rem] font-black text-xs tracking-[0.2em] uppercase shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:shadow-accent-cyan/20 active:scale-95 transition-all group overflow-hidden" 
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={items.length === 0}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    FINALIZAR CHECKOUT 
                    <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                </Button>
                
                <button 
                  onClick={onBack}
                  className="w-full py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-white transition-colors"
                >
                  Manter em aberto
                </button>
              </div>
            </div>
          </div>
        </div>
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
