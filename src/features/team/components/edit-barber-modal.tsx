'use client'

import { useState, useTransition } from 'react'
import { X, CircleNotch, FloppyDisk, UserCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CustomSelect } from '@/components/ui/custom-select'
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
        toast.success('Barbeiro atualizado com sucesso!')
        onClose()
      } else {
        toast.error(result.error || 'Erro ao atualizar.')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#141414] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
              <UserCircle size={28} weight="duotone" />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-syne text-white">Editar Perfil</h3>
              <p className="text-sm text-muted-foreground">{member.full_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-white transition-colors rounded-xl hover:bg-white/5">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Nome Completo *</label>
            <Input name="full_name" required defaultValue={member.full_name || ''} className="bg-white/5 border-white/10 rounded-xl h-12" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Telefone</label>
              <Input
                name="phone"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                className="bg-white/5 border-white/10 rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Especialidade *</label>
              <CustomSelect
                name="specialty"
                value={specialty}
                onChange={setSpecialty}
                options={[
                  { value: 'corte', label: 'Corte' },
                  { value: 'barba', label: 'Barba' },
                  { value: 'corte_barba', label: 'Corte + Barba' },
                  { value: 'outros', label: 'Outros' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">URL do Avatar</label>
            <Input name="avatar_url" defaultValue={member.avatar_url || ''} placeholder="https://..." className="bg-white/5 border-white/10 rounded-xl h-12" />
          </div>

          {canChangeStatus && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Status</label>
              <CustomSelect
                name="status"
                value={status}
                onChange={setStatus}
                options={[
                  { value: 'active', label: '● Ativo' },
                  { value: 'inactive', label: '● Inativo' },
                ]}
              />
            </div>
          )}

          {/* Info não-editável */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Informações fixas</p>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Email</span>
              <span className="text-white">{member.email || '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Cargo</span>
              <span className="text-white capitalize">{member.role}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Membro desde</span>
              <span className="text-white">{new Date(member.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex gap-4">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-2xl py-6 text-muted-foreground hover:text-white hover:bg-white/5">
              Cancelar
            </Button>
            <Button disabled={isPending} type="submit" className="flex-1 bg-accent-cyan hover:bg-cyan-400 text-black font-bold gap-2 rounded-2xl py-6 text-base shadow-lg shadow-cyan-500/20">
              {isPending ? <CircleNotch size={24} className="animate-spin" /> : <FloppyDisk size={24} />}
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
