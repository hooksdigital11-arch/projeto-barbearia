'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { PencilSimple, NoteBlank, Check } from '@phosphor-icons/react'
import { updateClientNotes } from '../actions'
import { cn } from '@/lib/utils/cn'

interface ClientNotesProps {
  clientId: string
  notes: string | null
  updatedAt: string | null
}

export function ClientNotes({ clientId, notes, updatedAt }: ClientNotesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(notes || '')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await updateClientNotes(clientId, value)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Notas salvas!')
        setIsEditing(false)
      }
    })
  }

  function handleCancel() {
    setValue(notes || '')
    setIsEditing(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-medium text-[#383838] uppercase tracking-[0.06em] flex items-center gap-2">
          <NoteBlank size={14} weight="regular" />
          Observações do barbeiro
        </h4>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[10px] font-medium bg-bg-sidebar border-[0.5px] border-border-main text-text-muted hover:text-text-secondary transition-all uppercase tracking-[0.04em]"
          >
            <PencilSimple size={12} weight="regular" />
            Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={2000}
            rows={6}
            placeholder="Preferências, alergias, observações importantes..."
            className="w-full px-4 py-3 rounded-[10px] border-[0.5px] border-border-main bg-bg-sidebar text-text-secondary text-[12px] placeholder:text-[#2a2a2a] focus:outline-none focus:border-accent-main/20 transition-all resize-none line-height-[1.6] uppercase"
            autoFocus
          />
          <div className="flex items-center justify-between pt-2 border-t-[0.5px] border-border-main">
            <span className="text-[9px] font-medium text-[#2e2e2e] tracking-widest uppercase">
              {value.length}/2000
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-[7px] text-[10px] font-medium bg-bg-sidebar border-[0.5px] border-border-main text-[#444] hover:text-[#777] transition-all uppercase tracking-[0.08em]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex items-center gap-2 px-5 py-2 rounded-[7px] text-[10px] font-medium bg-accent-main text-black hover:opacity-90 disabled:opacity-40 transition-all uppercase tracking-[0.08em]"
              >
                <Check size={14} weight="bold" />
                {isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-[10px] bg-bg-sidebar border-[0.5px] border-border-main min-h-[120px]">
          {notes ? (
            <p className="text-[12px] text-text-secondary whitespace-pre-wrap leading-relaxed uppercase">{notes}</p>
          ) : (
            <p className="text-[11px] text-[#2a2a2a] italic uppercase tracking-wider">
              Nenhuma observação registrada.
            </p>
          )}
        </div>
      )}

      {updatedAt && (
        <p className="text-[9px] text-[#222] font-medium uppercase tracking-[0.05em]">
          Última atualização: {new Date(updatedAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      )}
    </div>
  )
}
