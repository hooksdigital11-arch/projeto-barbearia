'use client'

import { useState, useTransition, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { createAppointment, updateAppointment } from '../actions'
import type { AppointmentWithRelations, ServiceOption, BarberOption, ClientOption } from '../types'
import { cn } from '@/lib/utils/cn'
import { X } from '@phosphor-icons/react'

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  appointment?: AppointmentWithRelations | null
  services: ServiceOption[]
  barbers: BarberOption[]
  clients: ClientOption[]
  isAdmin?: boolean
  defaultBarberId?: string
}

export function AppointmentModal({
  isOpen,
  onClose,
  appointment,
  services,
  barbers,
  clients,
  isAdmin = false,
  defaultBarberId,
}: AppointmentModalProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!appointment

  const [clientSearch, setClientSearch] = useState('')
  const [selectedClientId, setSelectedClientId] = useState(appointment?.client_id || '')
  const [selectedServiceId, setSelectedServiceId] = useState(appointment?.service_id || '')
  const [selectedBarberId, setSelectedBarberId] = useState(
    appointment?.barber_id || defaultBarberId || ''
  )
  const [startTime, setStartTime] = useState(
    appointment?.start_time
      ? new Date(appointment.start_time).toISOString().slice(0, 16)
      : ''
  )
  const [notes, setNotes] = useState(appointment?.notes || '')
  const [priceOverride, setPriceOverride] = useState(
    appointment?.price_cents ? (appointment.price_cents / 100).toFixed(2) : ''
  )

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSelectedClientId(appointment?.client_id || '')
      setSelectedServiceId(appointment?.service_id || '')
      setSelectedBarberId(appointment?.barber_id || defaultBarberId || '')
      setStartTime(
        appointment?.start_time
          ? new Date(appointment.start_time).toISOString().slice(0, 16)
          : ''
      )
      setNotes(appointment?.notes || '')
      setPriceOverride(
        appointment?.price_cents ? (appointment.price_cents / 100).toFixed(2) : ''
      )
      setClientSearch('')
    }
  }, [isOpen, appointment, defaultBarberId])

  const selectedService = services.find(s => s.id === selectedServiceId)

  const filteredClients = clientSearch.length >= 2
    ? clients.filter(c =>
        c.full_name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.phone || '').includes(clientSearch)
      )
    : []

  const selectedClient = clients.find(c => c.id === selectedClientId)

  const handleSubmit = () => {
    if (!selectedClientId) { toast.error('Selecione um cliente'); return }
    if (!selectedServiceId) { toast.error('Selecione um serviço'); return }
    if (!selectedBarberId) { toast.error('Selecione um barbeiro'); return }
    if (!startTime) { toast.error('Informe data e hora'); return }

    startTransition(async () => {
      const fd = new FormData()
      fd.append('client_id', selectedClientId)
      fd.append('service_id', selectedServiceId)
      fd.append('barber_id', selectedBarberId)
      fd.append('start_time', new Date(startTime).toISOString())
      if (notes) fd.append('notes', notes)
      if (priceOverride) fd.append('price_cents', String(Math.round(parseFloat(priceOverride) * 100)))

      let res
      if (isEditing) {
        fd.append('id', appointment!.id)
        res = await updateAppointment(fd)
      } else {
        res = await createAppointment(fd)
      }

      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(isEditing ? 'Agendamento atualizado!' : 'Agendamento criado!')
        onClose()
      }
    })
  }

  const inputClasses = "w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-muted tracking-[0.04em] outline-none transition-all focus:border-accent-main/25 focus:text-text-secondary"
  const labelClasses = "text-[10px] font-medium text-[#444] uppercase tracking-[0.1em]"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-bg-surface border-[0.5px] border-border-main rounded-[12px] p-[28px] sm:max-w-[460px] overflow-hidden gap-0 [&>button]:hidden shadow-none">
        <div className="flex items-center justify-between mb-8">
          <DialogTitle className="text-[16px] font-medium text-text-primary tracking-[0.06em] uppercase">
            {isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preencha os dados abaixo para {isEditing ? 'editar' : 'criar'} um agendamento na barbearia.
          </DialogDescription>
          <button 
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center bg-[#1a1a1a] border-[0.5px] border-[#2a2a2a] rounded-[6px] text-[#444] transition-all hover:text-text-primary hover:border-[#444]"
          >
            <X size={14} weight="regular" />
          </button>
        </div>

        <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 scrollbar-hide">
          {/* Cliente */}
          <div className="space-y-2">
            <label className={labelClasses}>Cliente</label>
            {selectedClient ? (
              <div className="flex items-center justify-between p-3 bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px]">
                <div>
                  <p className="text-[12px] font-medium text-text-primary uppercase tracking-tight">{selectedClient.full_name}</p>
                  <p className="text-[10px] text-[#444] font-medium uppercase mt-0.5">{selectedClient.phone || 'Sem telefone'}</p>
                </div>
                <button onClick={() => { setSelectedClientId(''); setClientSearch('') }} className="text-[10px] text-accent-main font-medium uppercase tracking-wider hover:opacity-80">
                  Trocar
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  placeholder="BUSCAR CLIENTE..."
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                  className={inputClasses}
                />
                {filteredClients.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-bg-surface border-[0.5px] border-border-main rounded-[8px] z-50 max-h-48 overflow-y-auto shadow-2xl">
                    {filteredClients.map(c => (
                      <button
                        key={c.id}
                        className="w-full text-left px-4 py-3 hover:bg-bg-sidebar transition-colors border-b-[0.5px] border-white/5 last:border-0"
                        onClick={() => { setSelectedClientId(c.id); setClientSearch('') }}
                      >
                        <p className="text-[12px] font-medium text-text-primary uppercase">{c.full_name}</p>
                        <p className="text-[10px] text-[#444] font-medium uppercase">{c.phone || 'Sem telefone'}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Barbeiro (só admin) */}
          {isAdmin && (
            <div className="space-y-2">
              <label className={labelClasses}>Barbeiro</label>
              <div className="relative">
                <select
                  value={selectedBarberId}
                  onChange={e => setSelectedBarberId(e.target.value)}
                  className={cn(inputClasses, "appearance-none cursor-pointer")}
                >
                  <option value="">Selecionar barbeiro...</option>
                  {barbers.map(b => (
                    <option key={b.id} value={b.id}>{b.full_name}</option>
                  ))}
                </select>
                <div className="absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none text-[#444]">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Serviço */}
          <div className="space-y-2">
            <label className={labelClasses}>Serviço</label>
            <div className="relative">
              <select
                value={selectedServiceId}
                onChange={e => setSelectedServiceId(e.target.value)}
                className={cn(inputClasses, "appearance-none cursor-pointer")}
              >
                <option value="">Selecionar serviço...</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.duration_minutes}min
                  </option>
                ))}
              </select>
              <div className="absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none text-[#444]">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Data/Hora */}
            <div className="space-y-2">
              <label className={labelClasses}>Data e Hora</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className={cn(inputClasses, "[color-scheme:dark]")}
              />
            </div>

            {/* Preço customizado */}
            <div className="space-y-2">
              <label className={labelClasses}>Preço (R$)</label>
              <div className="relative">
                <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[11px] text-[#444] font-medium">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceOverride}
                  onChange={e => setPriceOverride(e.target.value)}
                  placeholder={selectedService ? (selectedService.price_cents / 100).toFixed(2) : '0.00'}
                  className={cn(inputClasses, "pl-[36px]")}
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <label className={labelClasses}>Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="INFORMAÇÕES ADICIONAIS..."
              className={cn(inputClasses, "h-[80px] resize-none")}
            />
          </div>
        </div>

        <div className="mt-8 pt-5 border-t-[0.5px] border-border-main flex items-center gap-4">
          <button 
            className="text-[11px] font-medium text-[#444] hover:text-text-muted uppercase tracking-wider transition-all" 
            onClick={onClose} 
            disabled={isPending}
          >
            CANCELAR
          </button>
          <button 
            className="flex-1 bg-accent-main text-black h-[40px] rounded-[8px] text-[11px] font-medium uppercase tracking-[0.08em] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50" 
            onClick={handleSubmit} 
            disabled={isPending}
          >
            {isPending ? 'SALVANDO...' : isEditing ? 'SALVAR ALTERAÇÕES' : 'CRIAR AGENDAMENTO'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
