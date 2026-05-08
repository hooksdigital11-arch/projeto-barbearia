'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { WarningCircle } from '@phosphor-icons/react/dist/ssr'
import { deleteTemplate } from '../actions'
import type { MessageTemplate } from '../types'

interface TemplateDeleteConfirmProps {
  isOpen: boolean
  onClose: () => void
  template: MessageTemplate | null
  onSuccess: () => void
}

export function TemplateDeleteConfirm({ isOpen, onClose, template, onSuccess }: TemplateDeleteConfirmProps) {
  const [isPending, startTransition] = useTransition()

  if (!isOpen || !template) return null

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteTemplate(template.id)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Template deletado com sucesso')
        onSuccess()
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/5 rounded-2xl w-full max-w-[380px] p-6 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
          <WarningCircle size={32} weight="duotone" className="text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="font-syne font-bold text-xl text-white tracking-tight">Deletar template?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O template <strong className="text-white">"{template.name}"</strong> será removido permanentemente. Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-3 rounded-full border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 py-3 rounded-full bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Deletando...' : 'Sim, deletar'}
          </button>
        </div>
      </div>
    </div>
  )
}
