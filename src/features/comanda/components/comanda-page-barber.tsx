'use client'

import { useState, useEffect } from 'react'
import { Plus, Receipt, AlertCircle, Clock, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ComandaActive } from './comanda-active'
import { getActiveComanda } from '../queries'
import { ComandaItem } from '../types'

export function ComandaPageBarber({
  appointments,
  barber,
}: {
  appointments: any[]
  barber: any
}) {
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [items, setItems] = useState<ComandaItem[]>([])
  const [loading, setLoading] = useState(false)

  const handleSelectClient = async (appt: any) => {
    setLoading(true)
    const activeItems = await getActiveComanda(appt.client_id)
    setItems(activeItems as ComandaItem[])
    setSelectedClient({
      id: appt.client_id,
      name: appt.client?.full_name,
      appointment: appt
    })
    setLoading(false)
  }

  if (selectedClient) {
    return (
      <ComandaActive
        clientId={selectedClient.id}
        clientName={selectedClient.name}
        items={items}
        appointment={selectedClient.appointment}
        onBack={() => setSelectedClient(null)}
      />
    )
  }

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      {/* Header com Design Assimétrico */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-12 bg-accent-cyan rounded-full shadow-[0_0_30px_rgba(0,229,255,0.4)]" />
            <h1 className="text-5xl md:text-7xl font-black font-syne text-text-primary tracking-tighter leading-none uppercase">
              Atendimento<span className="text-accent-cyan">.</span>
            </h1>
          </div>
          <p className="text-text-secondary text-lg font-medium max-w-xl ml-7 border-l border-white/10 pl-6">
            Gestão operacional de comandas. Selecione um agendamento para abrir a comanda digital e processar o checkout com excelência.
          </p>
        </div>
        
        <Button 
          variant="cyan" 
          size="lg"
          className="gap-4 px-8 py-7 rounded-[2rem] font-black text-xs uppercase tracking-widest bg-white text-black hover:bg-accent-cyan transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-accent-cyan/20 active:scale-95 group ml-7 lg:ml-0"
          onClick={() => alert('Venda avulsa em desenvolvimento')}
        >
          <Plus size={22} className="group-hover:rotate-90 transition-transform duration-500" />
          Venda Avulsa
        </Button>
      </div>

      {/* Grid de Agendamentos (Comandas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {appointments.map((appt) => (
          <div 
            key={appt.id} 
            className="group relative"
            onClick={() => handleSelectClient(appt)}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-accent-cyan/20 to-transparent rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 group-hover:border-white/10 group-hover:bg-white/[0.04] transition-all duration-500 cursor-pointer overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <User size={32} className="text-accent-cyan opacity-40" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:bg-accent-cyan group-hover:text-black transition-all duration-500">
                  <Receipt size={20} />
                </div>
              </div>

              <div className="space-y-1 mb-8">
                <h3 className="text-2xl font-bold text-text-primary tracking-tight group-hover:text-accent-cyan transition-colors truncate">
                  {appt.client?.full_name}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={16} className="text-accent-cyan" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Serviço</p>
                  <p className="text-sm font-bold text-text-primary group-hover:translate-x-1 transition-transform duration-500 truncate max-w-[150px]">
                    {appt.service?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Valor</p>
                  <p className="text-xl font-bold text-accent-cyan font-syne tabular-nums">
                    R$ {(appt.price_cents / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              {loading && selectedClient?.id === appt.client_id && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-20">
                  <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/2">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-muted-foreground opacity-20" />
          </div>
          <h3 className="text-xl font-bold text-text-primary uppercase tracking-tight">Nenhum atendimento agendado</h3>
          <p className="text-muted-foreground max-w-xs mx-auto mt-2 text-sm">
            Seus clientes agendados aparecerão aqui para abertura de comanda.
          </p>
          <Button variant="outline" className="mt-8 border-white/10 hover:bg-white/5 uppercase font-bold text-xs">
            VER AGENDA COMPLETA
          </Button>
        </div>
      )}
    </div>
  )
}
