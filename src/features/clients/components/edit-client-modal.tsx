'use client'

import { useTransition, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { X, PencilSimple, CaretDown, Check } from '@phosphor-icons/react'
import { updateClientAction } from '../actions'
import type { ClientRecord, BarberOption } from '../types'

interface EditClientModalProps {
  isOpen: boolean
  onClose: () => void
  client: ClientRecord
  barbers: BarberOption[]
  isAdmin: boolean
}

export function EditClientModal({ isOpen, onClose, client, barbers, isAdmin }: EditClientModalProps) {
  const [isPending, startTransition] = useTransition()
  const [fullName, setFullName] = useState(client.full_name)
  const [phone, setPhone] = useState(client.phone || '')
  const [email, setEmail] = useState(client.email || '')
  const [birthday, setBirthday] = useState(client.birthday || '')
  const [preferredBarberId, setPreferredBarberId] = useState(client.preferred_barber_id || '')
  const [status, setStatus] = useState(client.status)

  // Reset on client change
  useEffect(() => {
    setFullName(client.full_name)
    setPhone(client.phone || '')
    setEmail(client.email || '')
    setBirthday(client.birthday || '')
    setPreferredBarberId(client.preferred_barber_id || '')
    setStatus(client.status)
  }, [client])

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const formData = new FormData()
    formData.append('full_name', fullName)
    formData.append('phone', phone)
    if (email) formData.append('email', email)
    if (birthday) formData.append('birthday', birthday)
    if (preferredBarberId) formData.append('preferred_barber_id', preferredBarberId)
    if (isAdmin) formData.append('status', status)

    startTransition(async () => {
      const result = await updateClientAction(client.id, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Cliente atualizado!')
        onClose()
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-[12px] border border-border-main bg-bg-surface overflow-hidden animate-in fade-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-[28px] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-[34px] h-[34px] flex items-center justify-center bg-[#1a1400] border-[0.5px] border-[#3a2e00] rounded-[7px] text-[#d4aa00] shrink-0">
              <PencilSimple size={18} weight="regular" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-[14px] font-medium text-text-primary uppercase tracking-tight">Editar Cliente</h2>
              <p className="text-[10px] text-[#383838] font-medium uppercase tracking-[0.04em]">{client.full_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center bg-[#1a1a1a] border-[0.5px] border-[#252525] rounded-[6px] text-[#444] transition-all hover:text-text-primary hover:border-[#444]"
          >
            <X size={13} weight="regular" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto px-[28px] pb-[28px]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">
                Nome completo <span className="text-accent-main">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 placeholder:text-[11px] placeholder:text-[#2a2a2a] uppercase"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">
                Telefone <span className="text-accent-main">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                required
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 placeholder:text-[11px] placeholder:text-[#2a2a2a]"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 placeholder:text-[11px] placeholder:text-[#2a2a2a] uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-[10px]">
              {/* Aniversário */}
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Aniversário</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 [color-scheme:dark]"
                />
              </div>

              {/* Barbeiro preferido */}
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Barbeiro pref.</label>
                <div className="relative">
                  <select
                    value={preferredBarberId}
                    onChange={(e) => setPreferredBarberId(e.target.value)}
                    className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 appearance-none cursor-pointer uppercase"
                  >
                    <option value="" className="bg-bg-surface">Nenhum</option>
                    {barbers.map(b => (
                      <option key={b.id} value={b.id} className="bg-bg-surface">
                        {b.full_name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none text-[#333]">
                    <CaretDown size={14} weight="regular" />
                  </div>
                </div>
              </div>
            </div>

            {/* Status (Admin only) */}
            {isAdmin && (
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Status</label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'blocked')}
                    className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 appearance-none cursor-pointer uppercase"
                  >
                    <option value="active" className="bg-bg-surface">Ativo</option>
                    <option value="blocked" className="bg-bg-surface">Bloqueado</option>
                    <option value="inactive" className="bg-bg-surface">Inativo</option>
                  </select>
                  <div className="absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none text-[#333]">
                    <CaretDown size={14} weight="regular" />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-[10px] pt-[18px] border-t-[0.5px] border-border-main">
              <button
                type="button"
                onClick={onClose}
                className="bg-bg-sidebar border-[0.5px] border-border-main text-[#444] py-[12px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:border-[#333] hover:text-[#777]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || !fullName || !phone}
                className="flex items-center justify-center gap-2 bg-accent-main text-black py-[12px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check size={14} weight="bold" />
                {isPending ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
