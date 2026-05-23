'use client'

import { useState } from 'react'
import { Plus, Receipt, Clock, User } from 'lucide-react'
import { toast } from 'sonner'
import { ComandaActive } from './comanda-active'
import { getActiveComanda } from '../queries'
import { ComandaItem } from '../types'

interface BarberAppointment {
  id: string
  client_id: string
  client: { full_name: string | null } | null
  service: { name: string | null } | null
  start_time: string
  price_cents: number
}

export function ComandaPageBarber({
  appointments,
}: {
  appointments: BarberAppointment[]
}) {
  const [selectedClient, setSelectedClient] = useState<{
    id: string
    name: string
    appointment: BarberAppointment
  } | null>(null)
  const [items, setItems] = useState<ComandaItem[]>([])
  const [loadingClientId, setLoadingClientId] = useState<string | null>(null)

  const handleSelectClient = async (appt: BarberAppointment) => {
    setLoadingClientId(appt.client_id)
    try {
      const activeItems = await getActiveComanda(appt.client_id)
      setItems(activeItems as ComandaItem[])
      setSelectedClient({
        id: appt.client_id,
        name: appt.client?.full_name || 'Desconhecido',
        appointment: appt
      })
    } finally {
      setLoadingClientId(null)
    }
  }

  const refreshItems = async () => {
    if (selectedClient) {
      const activeItems = await getActiveComanda(selectedClient.id)
      setItems(activeItems as ComandaItem[])
    }
  }

  if (selectedClient) {
    return (
      <ComandaActive
        clientId={selectedClient.id}
        clientName={selectedClient.name}
        items={items}
        onRefresh={refreshItems}
        appointment={{
          id: selectedClient.appointment.id,
          start_time: selectedClient.appointment.start_time,
          service: selectedClient.appointment.service?.name ? {
            name: selectedClient.appointment.service.name
          } : undefined
        }}
        onBack={() => setSelectedClient(null)}
      />
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.14em] mb-[6px]">GESTÃO OPERACIONAL</p>
          <h1 className="text-[28px] font-medium text-[#fff] tracking-[-0.01em] uppercase leading-none">
            Atendimento
          </h1>
          <p className="text-[11px] text-[#333] mt-1 font-medium uppercase tracking-wider">
            Selecione um agendamento para abrir a comanda digital e processar o checkout.
          </p>
        </div>
        
        <button 
          className="bg-accent-main text-black text-[10px] font-medium tracking-[0.1em] p-[10px_18px] rounded-[8px] flex items-center gap-2 hover:brightness-110 transition-all uppercase shrink-0"
          onClick={() => toast.info('Venda avulsa disponível em breve')}
        >
          <Plus className="w-3.5 h-3.5" />
          Venda Avulsa
        </button>
      </div>

      {/* Grid de Agendamentos (Comandas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {appointments.map((appt) => (
          <div 
            key={appt.id} 
            className="group relative flex flex-col justify-between p-5 rounded-[10px] border border-[#1a1a1a] bg-[#0f0f0f] hover:bg-[#111] hover:border-[#222] transition-all cursor-pointer overflow-hidden"
            onClick={() => handleSelectClient(appt)}
          >
            <div className="flex justify-between items-start mb-5">
              <div className="w-9 h-9 rounded-[8px] bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <User size={16} className="text-accent-main opacity-60" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-accent-main group-hover:text-black transition-all duration-300">
                <Receipt size={14} />
              </div>
            </div>

            <div className="space-y-1 mb-5">
              <h3 className="text-[14px] font-bold text-text-primary tracking-tight group-hover:text-accent-main transition-colors truncate">
                {appt.client?.full_name}
              </h3>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock size={12} className="text-accent-main" />
                <span className="text-[9px] font-medium uppercase tracking-wider">
                  {new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Serviço</p>
                <p className="text-xs font-bold text-text-primary truncate max-w-[120px]">
                  {appt.service?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Valor</p>
                <p className="text-sm font-bold text-accent-main font-mono">
                  R$ {(appt.price_cents / 100).toFixed(2)}
                </p>
              </div>
            </div>

            {loadingClientId === appt.client_id && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-20">
                <div className="w-6 h-6 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ))}
      </div>

      {appointments.length === 0 && (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] min-h-[360px] flex flex-col items-center justify-center p-8 gap-4">
          <Receipt className="w-8 h-8 text-[#1e1e1e]" />
          <div className="text-center space-y-1">
            <p className="text-[14px] font-medium text-[#333] uppercase tracking-wider">Nenhum atendimento agendado</p>
            <p className="text-[11px] text-[#222] uppercase tracking-widest">Seus clientes agendados aparecerão aqui para abertura de comanda.</p>
          </div>
          <button 
            className="mt-2 px-[18px] py-[10px] bg-transparent border border-white/10 hover:bg-white/5 text-[#fff] text-[10px] font-medium uppercase tracking-[0.1em] rounded-[8px] transition-all"
            onClick={() => toast.info('Agenda completa disponível em breve')}
          >
            Ver Agenda Completa
          </button>
        </div>
      )}
    </div>
  )
}
