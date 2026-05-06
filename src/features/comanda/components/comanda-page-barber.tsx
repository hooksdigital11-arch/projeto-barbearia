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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-syne text-white uppercase tracking-tight">Comandas Digitais</h1>
          <p className="text-muted-foreground">Selecione um cliente para iniciar ou gerenciar o atendimento.</p>
        </div>
        <Button 
          variant="secondary" 
          className="h-12 px-6 font-bold uppercase tracking-wider gap-2"
          onClick={() => alert('Venda avulsa em desenvolvimento')}
        >
          <Plus className="w-4 h-4" /> Venda Avulsa
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {appointments.map((appt) => (
          <Card 
            key={appt.id} 
            className="bg-[#141414] border-white/5 hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer group relative overflow-hidden"
            onClick={() => handleSelectClient(appt)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-white flex justify-between items-center uppercase">
                {appt.client?.full_name}
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Receipt className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-accent" />
                  <span>{new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[10px]">S</div>
                  <span>{appt.service?.name}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Clique para abrir</span>
                <span className="text-sm font-bold text-white">R$ {(appt.price_cents / 100).toFixed(2)}</span>
              </div>
            </CardContent>
            {loading && selectedClient?.id === appt.client_id && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </Card>
        ))}
      </div>

      {appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/2">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-muted-foreground opacity-20" />
          </div>
          <h3 className="text-xl font-bold text-white uppercase tracking-tight">Nenhum atendimento agendado</h3>
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
