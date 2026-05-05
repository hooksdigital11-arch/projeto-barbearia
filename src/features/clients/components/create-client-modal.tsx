'use client'

import { useTransition, useState } from 'react'
import { toast } from 'sonner'
import { X, UserPlus } from '@phosphor-icons/react'
import { createClientAction } from '../actions'
import type { BarberOption } from '../types'

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-bg-secondary shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5 sticky top-0 bg-bg-secondary z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-cyan/10">
              <UserPlus size={20} weight="bold" className="text-accent-cyan" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-syne">Novo Cliente</h2>
              <p className="text-xs text-text-secondary">Cadastrar cliente na base</p>
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
          {/* Nome */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Nome completo *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: João Silva"
              required
              minLength={2}
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 transition-all"
            />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Telefone WhatsApp *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(11) 98765-4321"
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 transition-all font-mono"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@email.com"
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Aniversário */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Aniversário</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 transition-all [color-scheme:dark]"
              />
            </div>

            {/* Barbeiro preferido */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Barbeiro pref.</label>
              <select
                value={preferredBarberId}
                onChange={(e) => setPreferredBarberId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 transition-all appearance-none"
              >
                <option value="" className="bg-bg-secondary text-text-secondary">Nenhum</option>
                {barbers.map(b => (
                  <option key={b.id} value={b.id} className="bg-bg-secondary text-white">
                    {b.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preferências, alergias, detalhes..."
              maxLength={2000}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 transition-all resize-none"
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
              disabled={isPending || !fullName || !phone}
              className="flex-1 px-4 py-3 rounded-xl bg-accent-cyan text-black font-bold text-sm hover:bg-accent-cyan/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isPending ? 'Salvando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
