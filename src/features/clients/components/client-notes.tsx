'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { PencilSimple, NoteBlank, FloppyDisk } from '@phosphor-icons/react'
import { updateClientNotes } from '../actions'

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
        <h4 className="text-sm font-medium text-text-secondary flex items-center gap-2">
          <NoteBlank size={16} weight="duotone" />
          Observações do barbeiro
        </h4>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
          >
            <PencilSimple size={12} weight="bold" />
            Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={2000}
            rows={6}
            placeholder="Preferências, alergias, observações importantes..."
            className="w-full px-4 py-3 rounded-xl border border-accent-cyan/30 bg-white/5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 transition-all resize-none"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              {value.length}/2000
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-white/5 text-text-secondary hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-accent-cyan text-black hover:bg-accent-cyan/90 disabled:opacity-40 transition-all"
              >
                <FloppyDisk size={12} weight="bold" />
                {isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5 min-h-[120px]">
          {notes ? (
            <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{notes}</p>
          ) : (
            <p className="text-sm text-text-secondary/50 italic">
              Nenhuma observação registrada. Clique em &quot;Editar&quot; para adicionar.
            </p>
          )}
        </div>
      )}

      {updatedAt && (
        <p className="text-[10px] text-text-secondary/50">
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
