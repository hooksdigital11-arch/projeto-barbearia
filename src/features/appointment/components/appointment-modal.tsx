'use client'

import { useState, useTransition, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createAppointment, updateAppointment } from '../actions'
import type { AppointmentWithRelations, ServiceOption, BarberOption, ClientOption } from '../types'

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#141414] border-white/10 sm:max-w-lg p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <DialogHeader>
            <DialogTitle className="font-syne uppercase tracking-tight text-white">
              {isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Cliente */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cliente</Label>
            {selectedClient ? (
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-white">{selectedClient.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedClient.phone || 'Sem telefone'}</p>
                </div>
                <button onClick={() => { setSelectedClientId(''); setClientSearch('') }} className="text-xs text-red-400 hover:text-red-300">
                  Trocar
                </button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  placeholder="Buscar por nome ou telefone..."
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
                {filteredClients.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
                    {filteredClients.map(c => (
                      <button
                        key={c.id}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors"
                        onClick={() => { setSelectedClientId(c.id); setClientSearch('') }}
                      >
                        <p className="text-sm font-medium text-white">{c.full_name}</p>
                        <p className="text-xs text-muted-foreground">{c.phone || 'Sem telefone'}</p>
                      </button>
                    ))}
                  </div>
                )}
                {clientSearch.length >= 2 && filteredClients.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1 px-1">Nenhum cliente encontrado.</p>
                )}
              </div>
            )}
          </div>

          {/* Barbeiro (só admin) */}
          {isAdmin && (
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Barbeiro</Label>
              <select
                value={selectedBarberId}
                onChange={e => setSelectedBarberId(e.target.value)}
                className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-cyan"
              >
                <option value="">Selecionar barbeiro...</option>
                {barbers.map(b => (
                  <option key={b.id} value={b.id}>{b.full_name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Serviço */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Serviço</Label>
            <select
              value={selectedServiceId}
              onChange={e => setSelectedServiceId(e.target.value)}
              className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-cyan"
            >
              <option value="">Selecionar serviço...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.duration_minutes}min — R$ {(s.price_cents / 100).toFixed(2)}
                </option>
              ))}
            </select>
            {selectedService && (
              <p className="text-xs text-muted-foreground pl-1">
                Duração: {selectedService.duration_minutes}min · Preço padrão: R$ {(selectedService.price_cents / 100).toFixed(2)}
              </p>
            )}
          </div>

          {/* Data/Hora */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Data e Hora</Label>
            <Input
              type="datetime-local"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="bg-white/5 border-white/10 [color-scheme:dark]"
            />
          </div>

          {/* Preço customizado */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Preço (R$) — opcional, usa padrão do serviço se vazio
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={priceOverride}
                onChange={e => setPriceOverride(e.target.value)}
                placeholder={selectedService ? (selectedService.price_cents / 100).toFixed(2) : '0.00'}
                className="bg-white/5 border-white/10 pl-9"
              />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Observações</Label>
            <textarea
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              placeholder="Informações adicionais..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted-foreground resize-none h-20 focus:outline-none focus:ring-1 focus:ring-accent-cyan"
            />
          </div>
        </div>

        <div className="p-6 border-t border-white/5 flex gap-4">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={isPending}>
            CANCELAR
          </Button>
          <Button variant="cyan" className="flex-[2] font-bold uppercase" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'SALVANDO...' : isEditing ? 'SALVAR ALTERAÇÕES' : 'CRIAR AGENDAMENTO'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
