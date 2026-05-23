'use client'

import { useTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PencilSimple, Check, X } from '@phosphor-icons/react'
import { updateClientProfileSchema, type UpdateClientProfileInput } from '../schemas'
import { updateClientProfile } from '../actions'

interface ProfileEditFormProps {
  initialName: string
  initialPhone: string
}

export function ProfileEditForm({ initialName, initialPhone }: ProfileEditFormProps) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<UpdateClientProfileInput>({
    resolver: zodResolver(updateClientProfileSchema),
    defaultValues: {
      full_name: initialName,
      phone: initialPhone,
    },
  })

  function onSubmit(data: UpdateClientProfileInput) {
    startTransition(async () => {
      const fd = new FormData()
      fd.append('full_name', data.full_name)
      fd.append('phone', data.phone || '')

      const result = await updateClientProfile(fd)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Perfil atualizado!')
        setEditing(false)
      }
    })
  }

  function handleCancel() {
    form.reset()
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-2 px-[14px] py-[8px] bg-[#141414] border border-[#1e1e1e] text-[#555] text-[10px] font-medium uppercase tracking-wider rounded-[7px] hover:border-[#2a2a2a] hover:text-[#888] transition-all"
      >
        <PencilSimple size={12} weight="bold" />
        Editar Perfil
      </button>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[10px]">
      <div className="p-[16px_22px] border-b border-[#141414] space-y-[6px]">
        <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.1em]">Nome completo</label>
        <input
          {...form.register('full_name')}
          className="w-full bg-[#0d0d0d] border border-[#222] rounded-[6px] px-[12px] py-[8px] text-[12px] text-[#fff] placeholder-[#333] focus:outline-none focus:border-[#333] transition-colors"
          placeholder="Seu nome"
        />
        {form.formState.errors.full_name && (
          <p className="text-[10px] text-[#ef4444]">{form.formState.errors.full_name.message}</p>
        )}
      </div>

      <div className="p-[16px_22px] space-y-[6px]">
        <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.1em]">Telefone</label>
        <input
          {...form.register('phone')}
          className="w-full bg-[#0d0d0d] border border-[#222] rounded-[6px] px-[12px] py-[8px] text-[12px] text-[#fff] placeholder-[#333] focus:outline-none focus:border-[#333] transition-colors"
          placeholder="(00) 00000-0000"
          type="tel"
        />
        {form.formState.errors.phone && (
          <p className="text-[10px] text-[#ef4444]">{form.formState.errors.phone.message}</p>
        )}
      </div>

      <div className="px-[22px] pb-[16px] flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-[14px] py-[8px] bg-accent-main text-black text-[10px] font-medium uppercase tracking-wider rounded-[7px] hover:brightness-110 transition-all disabled:opacity-50"
        >
          <Check size={12} weight="bold" />
          {isPending ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-2 px-[14px] py-[8px] bg-[#141414] border border-[#1e1e1e] text-[#555] text-[10px] font-medium uppercase tracking-wider rounded-[7px] hover:border-[#2a2a2a] hover:text-[#888] transition-all"
        >
          <X size={12} weight="bold" />
          Cancelar
        </button>
      </div>
    </form>
  )
}
