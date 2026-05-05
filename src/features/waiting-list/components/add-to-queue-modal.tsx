'use client'

import { useTransition, useState } from 'react'
import { toast } from 'sonner'
import { X, Plus } from '@phosphor-icons/react'
import { joinQueue } from '../actions'
import type { ServiceOption, BarberOption, ClientOption } from '../types'

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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-bg-secondary shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-cyan/10">
              <Plus size={20} weight="bold" className="text-accent-cyan" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-syne">Adicionar à Fila</h2>
              <p className="text-xs text-text-secondary">Cliente será adicionado à fila de espera</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Cliente */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Cliente *</label>
            <select
              value={clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 transition-all appearance-none"
            >
              <option value="" className="bg-bg-secondary text-text-secondary">
                Selecionar cliente...
              </option>
              {clients.map(c => (
                <option key={c.id} value={c.id} className="bg-bg-secondary text-white">
                  {c.full_name} {c.phone ? `— ${c.phone}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Serviço */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Serviço desejado *</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 transition-all appearance-none"
            >
              <option value="" className="bg-bg-secondary text-text-secondary">
                Selecionar serviço...
              </option>
              {services.map(s => (
                <option key={s.id} value={s.id} className="bg-bg-secondary text-white">
                  {s.name} ({s.duration_minutes}min)
                </option>
              ))}
            </select>
          </div>

          {/* Barbeiro preferido */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Barbeiro preferido</label>
            <select
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 transition-all appearance-none"
            >
              <option value="" className="bg-bg-secondary text-text-secondary">
                Qualquer barbeiro
              </option>
              {barbers.map(b => (
                <option key={b.id} value={b.id} className="bg-bg-secondary text-white">
                  {b.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Telefone WhatsApp */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">WhatsApp *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 98765-4321"
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-text-secondary hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !clientId || !serviceId || !phone}
              className="flex-1 px-4 py-3 rounded-xl bg-accent-cyan text-black font-bold text-sm hover:bg-accent-cyan/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isPending ? 'Adicionando...' : 'Entrar na Fila'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
