'use client'

import { useTransition, useState } from 'react'
import { toast } from 'sonner'
import { X, Plus, CaretDown, ListBullets } from '@phosphor-icons/react'
import { joinQueue } from '../actions'
import type { ServiceOption, BarberOption, ClientOption } from '../types'
import { cn } from '@/lib/utils/cn'

interface AddToQueueModalProps {
  isOpen: boolean
  onClose: () => void
  services: ServiceOption[]
  barbers: BarberOption[]
  clients: ClientOption[]
}

export function AddToQueueModal({
  isOpen,
  onClose,
  services,
  barbers,
  clients,
}: AddToQueueModalProps) {
  const [isPending, startTransition] = useTransition()
  const [clientId, setClientId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [barberId, setBarberId] = useState('')
  const [phone, setPhone] = useState('')

  // Auto-preencher telefone ao selecionar cliente
  function handleClientChange(id: string) {
    setClientId(id)
    const selected = clients.find(c => c.id === id)
    if (selected?.phone) {
      setPhone(selected.phone)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const formData = new FormData()
    formData.append('client_id', clientId)
    formData.append('service_id', serviceId)
    if (barberId) formData.append('barber_id', barberId)
    formData.append('phone', phone)

    startTransition(async () => {
      const result = await joinQueue(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Na fila! Posição #${result.position}`)
        onClose()
        // Reset form
        setClientId('')
        setServiceId('')
        setBarberId('')
        setPhone('')
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-[12px] border border-border-main bg-bg-surface overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-[28px] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-[34px] h-[34px] flex items-center justify-center bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] text-accent-main shrink-0">
              <Plus size={18} weight="regular" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-[14px] font-medium text-text-primary uppercase tracking-tight">Adicionar à Fila</h2>
              <p className="text-[10px] text-[#383838] font-medium uppercase tracking-[0.03em]">Cliente será adicionado à fila de espera</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center bg-[#1a1a1a] border-[0.5px] border-[#252525] rounded-[6px] text-[#444] transition-all hover:text-text-primary hover:border-[#444]"
          >
            <X size={13} weight="regular" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto px-[28px] pb-[28px]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Cliente */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">
                Cliente <span className="text-accent-main">*</span>
              </label>
              <div className="relative">
                <select
                  value={clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  required
                  className="w-full appearance-none bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] pr-[36px] py-[11px] text-[12px] font-medium text-text-secondary tracking-[0.03em] outline-none transition-all focus:border-accent-main/20 uppercase cursor-pointer"
                >
                  <option value="" className="bg-bg-surface">SELECIONAR CLIENTE...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id} className="bg-bg-surface">
                      {c.full_name.toUpperCase()} {c.phone ? `— ${c.phone}` : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none text-[#333]">
                  <CaretDown size={14} weight="regular" />
                </div>
              </div>
            </div>

            {/* Serviço */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">
                Serviço desejado <span className="text-accent-main">*</span>
              </label>
              <div className="relative">
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                  className="w-full appearance-none bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] pr-[36px] py-[11px] text-[12px] font-medium text-text-secondary tracking-[0.03em] outline-none transition-all focus:border-accent-main/20 uppercase cursor-pointer"
                >
                  <option value="" className="bg-bg-surface">SELECIONAR SERVIÇO...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id} className="bg-bg-surface">
                      {s.name.toUpperCase()} ({s.duration_minutes}MIN)
                    </option>
                  ))}
                </select>
                <div className="absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none text-[#333]">
                  <CaretDown size={14} weight="regular" />
                </div>
              </div>
            </div>

            {/* Barbeiro preferido */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Barbeiro preferido</label>
              <div className="relative">
                <select
                  value={barberId}
                  onChange={(e) => setBarberId(e.target.value)}
                  className="w-full appearance-none bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] pr-[36px] py-[11px] text-[12px] font-medium text-text-secondary tracking-[0.03em] outline-none transition-all focus:border-accent-main/20 uppercase cursor-pointer"
                >
                  <option value="" className="bg-bg-surface">QUALQUER BARBEIRO</option>
                  {barbers.map(b => (
                    <option key={b.id} value={b.id} className="bg-bg-surface">
                      {b.full_name.toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none text-[#333]">
                  <CaretDown size={14} weight="regular" />
                </div>
              </div>
            </div>

            {/* Telefone WhatsApp */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">
                WhatsApp <span className="text-accent-main">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                required
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 placeholder:text-[11px] placeholder:text-[#2a2a2a]"
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-[10px] pt-[18px] border-t-[0.5px] border-border-main mt-[22px]">
              <button
                type="button"
                onClick={onClose}
                className="bg-bg-sidebar border-[0.5px] border-border-main text-[#444] py-[12px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:border-[#333] hover:text-[#777]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || !clientId || !serviceId || !phone}
                className="flex items-center justify-center gap-2 bg-accent-main text-black py-[12px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_10px_20px_rgba(0,212,170,0.1)]"
              >
                <ListBullets size={14} weight="bold" />
                {isPending ? 'ADICIONANDO...' : 'ADICIONAR À FILA'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
