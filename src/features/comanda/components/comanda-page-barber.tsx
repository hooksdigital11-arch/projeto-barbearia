'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Receipt, Clock, User, Search } from 'lucide-react'
import { toast } from 'sonner'
import { ComandaActive } from './comanda-active'
import { getActiveComandaAction } from '../actions'
import { ComandaItem } from '../types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface BarberAppointment {
  id: string
  client_id: string
  client: { full_name: string | null } | null
  service: { name: string | null } | null
  start_time: string
  price_cents: number
}

interface ClientOption {
  id: string
  full_name: string
  phone?: string | null
}

export function ComandaPageBarber({
  appointments,
  clients,
}: {
  appointments: BarberAppointment[]
  clients: ClientOption[]
}) {
  const router = useRouter()
  const [selectedClient, setSelectedClient] = useState<{
    id: string
    name: string
    appointment: BarberAppointment | null
  } | null>(null)
  const [items, setItems] = useState<ComandaItem[]>([])
  const [loadingClientId, setLoadingClientId] = useState<string | null>(null)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [searchClientTerm, setSearchClientTerm] = useState('')

  const handleSelectClient = async (appt: BarberAppointment) => {
    setLoadingClientId(appt.client_id)
    try {
      const result = await getActiveComandaAction(appt.client_id)
      if ('error' in result && result.error) {
        toast.error(result.error)
        return
      }
      const activeItems = result.data || []
      setItems(activeItems as ComandaItem[])
      setSelectedClient({
        id: appt.client_id,
        name: appt.client?.full_name || 'Desconhecido',
        appointment: appt
      })
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar comanda')
    } finally {
      setLoadingClientId(null)
    }
  }

  const handleSelectClientOption = async (client: ClientOption) => {
    setLoadingClientId(client.id)
    try {
      const result = await getActiveComandaAction(client.id)
      if ('error' in result && result.error) {
        toast.error(result.error)
        return
      }
      const activeItems = result.data || []
      setItems(activeItems as ComandaItem[])
      setSelectedClient({
        id: client.id,
        name: client.full_name,
        appointment: null
      })
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar comanda')
    } finally {
      setLoadingClientId(null)
    }
  }

  const refreshItems = async () => {
    if (selectedClient) {
      const result = await getActiveComandaAction(selectedClient.id)
      if ('success' in result && result.success && result.data) {
        setItems(result.data as ComandaItem[])
      }
    }
  }


  if (selectedClient) {
    return (
      <ComandaActive
        clientId={selectedClient.id}
        clientName={selectedClient.name}
        items={items}
        onRefresh={refreshItems}
        appointment={selectedClient.appointment ? {
          id: selectedClient.appointment.id,
          start_time: selectedClient.appointment.start_time,
          service: selectedClient.appointment.service?.name ? {
            name: selectedClient.appointment.service.name
          } : undefined
        } : null}
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
          className="bg-accent-main text-black text-[10px] font-medium tracking-[0.1em] p-[10px_18px] rounded-[8px] flex items-center gap-2 hover:brightness-110 transition-all uppercase shrink-0 cursor-pointer"
          onClick={() => setIsClientModalOpen(true)}
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
            className="mt-2 px-[18px] py-[10px] bg-transparent border border-white/10 hover:bg-white/5 text-[#fff] text-[10px] font-medium uppercase tracking-[0.1em] rounded-[8px] transition-all cursor-pointer"
            onClick={() => router.push('/barber/appointments')}
          >
            Ver Agenda Completa
          </button>
        </div>
      )}

      {/* Modal de Seleção de Cliente para Venda Avulsa */}
      <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
        <DialogContent className="bg-bg-surface border-white/10 max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-syne uppercase tracking-tight text-text-primary text-[18px]">
              Selecionar Cliente
            </DialogTitle>
          </DialogHeader>
          <div className="relative group bg-[#111] border border-white/5 rounded-[8px] flex items-center px-[14px] mt-4 mb-4">
            <Search size={14} className="text-[#555] shrink-0" />
            <input
              type="text"
              placeholder="BUSCAR CLIENTE PELO NOME..."
              value={searchClientTerm}
              onChange={(e) => setSearchClientTerm(e.target.value)}
              className="bg-transparent border-none outline-none py-[10px] pl-[10px] text-[11px] text-text-secondary placeholder:text-[#444] w-full font-medium"
            />
          </div>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {clients
              .filter(client => 
                client.full_name.toLowerCase().includes(searchClientTerm.toLowerCase())
              )
              .map(client => (
                <div
                  key={client.id}
                  className="flex justify-between items-center p-3.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                  onClick={() => {
                    setIsClientModalOpen(false)
                    setSearchClientTerm('')
                    handleSelectClientOption(client)
                  }}
                >
                  <div>
                    <p className="font-bold text-text-primary uppercase text-[12px] tracking-wide">
                      {client.full_name}
                    </p>
                    {client.phone && (
                      <p className="text-[10px] text-muted-foreground">{client.phone}</p>
                    )}
                  </div>
                  <span className="text-[9px] font-semibold text-accent-main uppercase tracking-wider group-hover:underline">
                    Selecionar
                  </span>
                </div>
              ))}
            {clients.filter(client => 
              client.full_name.toLowerCase().includes(searchClientTerm.toLowerCase())
            ).length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-xs uppercase tracking-wider">
                Nenhum cliente encontrado
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
