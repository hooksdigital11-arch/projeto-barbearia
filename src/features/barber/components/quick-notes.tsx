'use client'

import { useState, useEffect } from 'react'
import { Note, CloudCheck, CloudArrowUp } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

export function QuickNotes({ initialNote }: { initialNote: string }) {
  const [note, setNote] = useState(initialNote)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (note !== initialNote) {
        saveNote(note)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [note, initialNote])

  const saveNote = async (content: string) => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 800))
    setIsSaving(false)
    toast.success('Nota salva automaticamente', { 
      icon: <CloudCheck size={16} />,
      duration: 1500
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
          <Note size={16} />
          Notas do Atendimento
        </label>
        {isSaving ? (
          <span className="flex items-center gap-1 text-[10px] text-accent-cyan animate-pulse">
            <CloudArrowUp size={12} /> Salvando...
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-emerald-500">
            <CloudCheck size={12} /> Sincronizado
          </span>
        )}
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Adicione observações importantes sobre o cliente..."
        className="w-full h-24 p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-cyan/50 focus:bg-white/10 transition-all resize-none"
      />
    </div>
  )
}
