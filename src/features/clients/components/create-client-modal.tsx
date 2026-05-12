'use client'

import { useTransition, useState } from 'react'
import { toast } from 'sonner'
import { X, UserPlus, CaretDown } from '@phosphor-icons/react'
import { createClientAction } from '../actions'
import type { BarberOption } from '../types'
import { cn } from '@/lib/utils/cn'

interface CreateClientModalProps {
  isOpen: boolean
  onClose: () => void
  barbers: BarberOption[]
}

export function CreateClientModal({ isOpen, onClose, barbers }: CreateClientModalProps) {
  const [isPending, startTransition] = useTransition()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [birthday, setBirthday] = useState('')
  const [preferredBarberId, setPreferredBarberId] = useState('')
  const [notes, setNotes] = useState('')

  function resetForm() {
    setFullName('')
    setPhone('')
    setEmail('')
    setBirthday('')
    setPreferredBarberId('')
    setNotes('')
  }

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
    if (notes) formData.append('notes', notes)

    startTransition(async () => {
      const result = await createClientAction(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Cliente cadastrado!')
        resetForm()
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
            <div className="w-9 h-9 flex items-center justify-center bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-accent-main shrink-0">
              <UserPlus size={18} weight="regular" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-[15px] font-medium text-text-primary uppercase tracking-tight">Novo Cliente</h2>
              <p className="text-[10px] text-[#383838] font-medium uppercase tracking-[0.04em]">CADASTRAR CLIENTE NA BASE</p>
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
                placeholder="EX: JOÃO SILVA"
                required
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 placeholder:text-[11px] placeholder:text-[#2a2a2a] uppercase"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">
                Telefone WhatsApp <span className="text-accent-main">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 98765-4321"
                required
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 placeholder:text-[11px] placeholder:text-[#2a2a2a]"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="JOAO@EMAIL.COM"
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 placeholder:text-[11px] placeholder:text-[#2a2a2a] uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Aniversário */}
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Aniversário</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 [color-scheme:dark]"
                />
              </div>

              {/* Barbeiro preferido */}
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Barbeiro pref.</label>
                <div className="relative">
                  <select
                    value={preferredBarberId}
                    onChange={(e) => setPreferredBarberId(e.target.value)}
                    className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 appearance-none cursor-pointer uppercase"
                  >
                    <option value="" className="bg-bg-surface">Nenhum</option>
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
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Observações</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="PREFERÊNCIAS, ALERGIAS, DETALHES..."
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 placeholder:text-[11px] placeholder:text-[#2a2a2a] resize-none h-[80px] line-height-[1.6] uppercase"
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t-[0.5px] border-border-main">
              <button
                type="button"
                onClick={onClose}
                className="bg-bg-sidebar border-[0.5px] border-border-main text-[#444] py-[13px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:border-[#333] hover:text-[#777]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || !fullName || !phone}
                className="flex items-center justify-center gap-2 bg-accent-main text-black py-[13px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <UserPlus size={14} weight="regular" />
                {isPending ? 'SALVANDO...' : 'CADASTRAR CLIENTE'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
