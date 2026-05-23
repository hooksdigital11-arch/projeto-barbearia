'use client'

import { useState, useTransition, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { X, Scissors, User, Clock } from '@phosphor-icons/react'
import { createClientAppointment } from '../actions'
import type { ServiceOption, BarberOption } from '../types'

interface ClientBookingModalProps {
  isOpen: boolean
  onClose: () => void
  services: ServiceOption[]
  barbers: BarberOption[]
  initialServiceId?: string
}

export function ClientBookingModal({
  isOpen,
  onClose,
  services,
  barbers,
  initialServiceId,
}: ClientBookingModalProps) {
  const [isPending, startTransition] = useTransition()
  const [serviceId, setServiceId] = useState(initialServiceId || '')
  const [barberId, setBarberId] = useState('')
  const [startTime, setStartTime] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (isOpen) {
      setServiceId(initialServiceId || '')
      setBarberId('')
      setStartTime('')
      setNotes('')
    }
  }, [isOpen, initialServiceId])

  const selectedService = services.find(s => s.id === serviceId)

  // Min datetime: now rounded up to next hour
  const minDateTime = (() => {
    const d = new Date()
    d.setMinutes(0, 0, 0)
    d.setHours(d.getHours() + 1)
    return d.toISOString().slice(0, 16)
  })()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!serviceId || !barberId || !startTime) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    startTransition(async () => {
      const fd = new FormData()
      fd.append('service_id', serviceId)
      fd.append('barber_id', barberId)
      fd.append('start_time', startTime)
      if (notes) fd.append('notes', notes)

      const result = await createClientAppointment(fd)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Agendamento realizado!')
        onClose()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[12px] p-0 max-w-[480px] w-full gap-0 [&>button]:hidden">
        <DialogTitle className="sr-only">Novo Agendamento</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between p-[18px_22px] border-b border-[#141414]">
          <div>
            <p className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.14em]">NOVO</p>
            <h2 className="text-[16px] font-medium text-[#fff] uppercase tracking-tight leading-none mt-[3px]">Agendar Serviço</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[6px] bg-[#141414] border border-[#1e1e1e] flex items-center justify-center text-[#444] hover:text-[#888] transition-colors"
          >
            <X size={12} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-[18px_22px] space-y-[14px]">
          {/* Service */}
          <div className="space-y-[6px]">
            <label className="flex items-center gap-[5px] text-[9px] font-medium text-[#383838] uppercase tracking-[0.1em]">
              <Scissors size={10} weight="bold" />
              Serviço
            </label>
            <select
              value={serviceId}
              onChange={e => setServiceId(e.target.value)}
              required
              className="w-full bg-[#0d0d0d] border border-[#222] rounded-[6px] px-[12px] py-[9px] text-[12px] text-[#fff] focus:outline-none focus:border-[#333] transition-colors appearance-none cursor-pointer"
            >
              <option value="" className="text-[#444]">Selecionar serviço...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} — R$ {(s.price_cents / 100).toFixed(0)} • {s.duration_minutes}min
                </option>
              ))}
            </select>
            {selectedService && (
              <p className="text-[9px] text-[#2a2a2a] uppercase tracking-wide">
                Duração: {selectedService.duration_minutes}min · R$ {(selectedService.price_cents / 100).toFixed(2)}
              </p>
            )}
          </div>

          {/* Barber */}
          <div className="space-y-[6px]">
            <label className="flex items-center gap-[5px] text-[9px] font-medium text-[#383838] uppercase tracking-[0.1em]">
              <User size={10} weight="bold" />
              Barbeiro
            </label>
            <select
              value={barberId}
              onChange={e => setBarberId(e.target.value)}
              required
              className="w-full bg-[#0d0d0d] border border-[#222] rounded-[6px] px-[12px] py-[9px] text-[12px] text-[#fff] focus:outline-none focus:border-[#333] transition-colors appearance-none cursor-pointer"
            >
              <option value="">Selecionar barbeiro...</option>
              {barbers.map(b => (
                <option key={b.id} value={b.id}>{b.full_name}</option>
              ))}
            </select>
          </div>

          {/* Date/Time */}
          <div className="space-y-[6px]">
            <label className="flex items-center gap-[5px] text-[9px] font-medium text-[#383838] uppercase tracking-[0.1em]">
              <Clock size={10} weight="bold" />
              Data e Horário
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              min={minDateTime}
              required
              className="w-full bg-[#0d0d0d] border border-[#222] rounded-[6px] px-[12px] py-[9px] text-[12px] text-[#fff] focus:outline-none focus:border-[#333] transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Notes (optional) */}
          <div className="space-y-[6px]">
            <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.1em]">
              Observações (opcional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Alguma preferência ou detalhe..."
              className="w-full bg-[#0d0d0d] border border-[#222] rounded-[6px] px-[12px] py-[9px] text-[12px] text-[#fff] placeholder-[#2a2a2a] focus:outline-none focus:border-[#333] transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-2 pt-[4px]">
            <button
              type="submit"
              disabled={isPending || !serviceId || !barberId || !startTime}
              className="flex-1 py-[10px] bg-accent-main text-black text-[11px] font-medium uppercase tracking-[0.08em] rounded-[7px] hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-[16px] py-[10px] bg-[#141414] border border-[#1e1e1e] text-[#555] text-[11px] font-medium uppercase tracking-[0.08em] rounded-[7px] hover:border-[#2a2a2a] hover:text-[#888] transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
