'use client'

import { useState, useTransition } from 'react'
import { X, CircleNotch, FloppyDisk, UserCircle, CaretDown } from '@phosphor-icons/react'
import { updateBarber } from '../actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import type { TeamMemberWithStats } from '../types'

interface EditBarberModalProps {
  isOpen: boolean
  onClose: () => void
  member: TeamMemberWithStats | null
  canChangeStatus: boolean
}

export function EditBarberModal({ isOpen, onClose, member, canChangeStatus }: EditBarberModalProps) {
  const [isPending, startTransition] = useTransition()
  const [specialty, setSpecialty] = useState(member?.specialty || 'corte')
  const [status, setStatus] = useState(member?.status || 'active')
  const [phone, setPhone] = useState(member?.phone || '')

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits.length ? `(${digits}` : ''
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  if (!isOpen || !member) return null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!member) return
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updateBarber(member.id, formData)
      if (result.success) {
        toast.success('BARBEIRO ATUALIZADO!')
        onClose()
      } else {
        toast.error(result.error || 'ERRO AO ATUALIZAR.')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            <div className="w-[34px] h-[34px] flex items-center justify-center bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] text-text-nav shrink-0">
              <UserCircle size={18} weight="regular" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-[14px] font-medium text-text-primary uppercase tracking-tight">Editar Perfil</h2>
              <p className="text-[10px] text-[#383838] font-medium uppercase tracking-wide">{member.full_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-[28px] h-[28px] flex items-center justify-center bg-[#1a1a1a] border-[0.5px] border-[#252525] rounded-[6px] text-[#444] transition-all hover:text-text-primary"
          >
            <X size={13} weight="regular" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto px-[28px] pb-[28px]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Nome Completo <span className="text-accent-main">*</span></label>
              <input
                name="full_name"
                required
                defaultValue={member.full_name || ''}
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 uppercase"
              />
            </div>

            {/* Grid Telefone + Especialidade */}
            <div className="grid grid-cols-2 gap-[10px]">
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Telefone</label>
                <input
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Especialidade <span className="text-accent-main">*</span></label>
                <div className="relative">
                  <select
                    name="specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full appearance-none bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] pr-[32px] py-[11px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 uppercase cursor-pointer"
                  >
                    <option value="corte">CORTE</option>
                    <option value="barba">BARBA</option>
                    <option value="corte_barba">CORTE + BARBA</option>
                    <option value="outros">OUTROS</option>
                  </select>
                  <div className="absolute right-[11px] top-1/2 -translate-y-1/2 pointer-events-none text-[#333]">
                    <CaretDown size={14} weight="regular" />
                  </div>
                </div>
              </div>
            </div>

            {/* Avatar URL */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">URL do Avatar</label>
              <input
                name="avatar_url"
                defaultValue={member.avatar_url || ''}
                placeholder="https://..."
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20"
              />
            </div>

            {/* Status (Admin Only) */}
            {canChangeStatus && (
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Status</label>
                <div className="relative">
                  <select
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full appearance-none bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] pr-[32px] py-[11px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 uppercase cursor-pointer"
                  >
                    <option value="active">● ATIVO</option>
                    <option value="inactive">● INATIVO</option>
                  </select>
                  <div className="absolute right-[11px] top-1/2 -translate-y-1/2 pointer-events-none text-[#333]">
                    <CaretDown size={14} weight="regular" />
                  </div>
                </div>
              </div>
            )}

            {/* Info Fixa */}
            <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[14px] px-[16px]">
              <p className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.12em] mb-[10px]">Informações fixas</p>
              <div className="space-y-1">
                <div className="flex justify-between py-[5px] border-b border-border-main">
                  <span className="text-[10px] font-medium text-[#333] uppercase">EMAIL</span>
                  <span className="text-[10px] font-medium text-[#666] uppercase">{member.email || '—'}</span>
                </div>
                <div className="flex justify-between py-[5px] border-b border-border-main">
                  <span className="text-[10px] font-medium text-[#333] uppercase">CARGO</span>
                  <span className="text-[10px] font-medium text-[#666] uppercase">{member.role}</span>
                </div>
                <div className="flex justify-between py-[5px]">
                  <span className="text-[10px] font-medium text-[#333] uppercase">MEMBRO DESDE</span>
                  <span className="text-[10px] font-medium text-[#666] uppercase">{new Date(member.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="grid grid-cols-2 gap-[10px] pt-[16px] border-t-[0.5px] border-border-main mt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-bg-sidebar border-[0.5px] border-border-main text-[#444] py-[12px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:border-[#333] hover:text-[#777]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center justify-center gap-2 bg-accent-main text-black py-[12px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:opacity-90 disabled:opacity-40"
              >
                {isPending ? (
                  <CircleNotch size={14} className="animate-spin" />
                ) : (
                  <FloppyDisk size={14} weight="bold" />
                )}
                SALVAR
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
