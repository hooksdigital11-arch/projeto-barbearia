'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { X, FileText, FloppyDisk, CaretDown, CircleNotch } from '@phosphor-icons/react'
import { createTemplate, updateTemplate } from '../actions'
import type { MessageTemplate } from '../types'

interface TemplateEditorModalProps {
  isOpen: boolean
  onClose: () => void
  template: MessageTemplate | null
  onSuccess: () => void
  mode: 'create' | 'edit' | 'duplicate'
}

const VARIABLES = [
  { key: '{nome}', label: 'Nome' },
  { key: '{data}', label: 'Data' },
  { key: '{horario}', label: 'Horário' },
  { key: '{servico}', label: 'Serviço' },
  { key: '{barbeiro}', label: 'Barbeiro' },
  { key: '{valor}', label: 'Valor' },
  { key: '{link_agendamento}', label: 'Link' },
]

export function TemplateEditorModal({ isOpen, onClose, template, onSuccess, mode }: TemplateEditorModalProps) {
  const [isPending, startTransition] = useTransition()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [triggerType, setTriggerType] = useState('manual')
  const [content, setContent] = useState('')
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && template) {
        setName(template.name)
        setDescription(template.description || '')
        setTriggerType(template.trigger_type)
        setContent(template.content)
      } else if (mode === 'duplicate' && template) {
        setName(`${template.name} (CÓPIA)`)
        setDescription(template.description || '')
        setTriggerType(template.trigger_type)
        setContent(template.content)
      } else {
        setName('')
        setDescription('')
        setTriggerType('manual')
        setContent('')
      }
    }
  }, [isOpen, template, mode])

  if (!isOpen) return null

  const title = mode === 'create' ? 'Novo Template' : mode === 'edit' ? 'Editar Template' : 'Duplicar Template'

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    const newContent = content.substring(0, start) + variable + content.substring(end)
    setContent(newContent)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variable.length, start + variable.length)
    }, 0)
  }

  const handleSave = () => {
    if (name.length < 3) return toast.error('Nome muito curto')
    if (content.length < 10) return toast.error('Mensagem deve ter no mínimo 10 caracteres')

    startTransition(async () => {
      const fd = new FormData()
      fd.append('name', name)
      fd.append('description', description)
      fd.append('trigger_type', triggerType)
      fd.append('content', content)

      let res
      if (mode === 'edit' && template) {
        fd.append('id', template.id)
        res = await updateTemplate(fd)
      } else {
        res = await createTemplate(fd)
      }

      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(mode === 'edit' ? 'TEMPLATE ATUALIZADO!' : 'TEMPLATE CRIADO!')
        onSuccess()
        onClose()
      }
    })
  }

  const getPreview = () => {
    return content
      .replace(/\{nome\}/g, 'JOÃO SILVA')
      .replace(/\{data\}/g, new Date(Date.now() + 86400000).toLocaleDateString('pt-BR'))
      .replace(/\{horario\}/g, '10:30')
      .replace(/\{servico\}/g, 'CORTE + BARBA')
      .replace(/\{barbeiro\}/g, 'RAFAEL')
      .replace(/\{valor\}/g, 'R$ 80,00')
      .replace(/\{link_agendamento\}/g, 'BARBEARIA.COM/AGENDAR')
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[480px] rounded-[12px] border border-border-main bg-bg-surface overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-[24px] pb-5 border-b-[0.5px] border-border-main">
          <div className="flex items-center gap-4">
            <div className="w-[32px] h-[32px] flex items-center justify-center bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] text-accent-main shrink-0">
              <FileText size={18} weight="regular" />
            </div>
            <h2 className="text-[14px] font-medium text-text-primary uppercase tracking-tight">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-[26px] h-[26px] flex items-center justify-center bg-[#1a1a1a] border-[0.5px] border-[#252525] rounded-[6px] text-[#444] transition-all hover:text-text-primary"
          >
            <X size={12} weight="regular" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto px-[24px] py-[24px] space-y-5 custom-scrollbar">
          {/* Nome */}
          <div className="space-y-2">
            <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Nome do Template *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value.toUpperCase())}
              maxLength={60}
              placeholder="EX: LEMBRETE DE AGENDAMENTO"
              className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary placeholder:text-[#222] outline-none transition-all focus:border-accent-main/20"
            />
            <p className="text-right text-[9px] text-[#2a2a2a] uppercase tracking-wide">{name.length}/60</p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Descrição</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value.toUpperCase())}
              maxLength={100}
              placeholder="EX: ENVIADO 1 DIA ANTES DO HORÁRIO"
              className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary placeholder:text-[#222] outline-none transition-all focus:border-accent-main/20"
            />
            <p className="text-right text-[9px] text-[#2a2a2a] uppercase tracking-wide">{description.length}/100</p>
          </div>

          {/* Tipo de Disparo */}
          <div className="space-y-2">
            <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Tipo de Disparo</label>
            <div className="relative">
              <select
                value={triggerType}
                onChange={e => setTriggerType(e.target.value)}
                className="w-full appearance-none bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] pr-[30px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 uppercase cursor-pointer"
              >
                <option value="manual">Manual (Admin)</option>
                <option value="reminder">Lembrete (1 dia antes)</option>
                <option value="confirmation">Confirmação (Ao agendar)</option>
                <option value="birthday">Aniversário (Dia)</option>
                <option value="loyalty">Fidelidade (Prêmio)</option>
                <option value="reactivation">Reativação (+30 dias)</option>
              </select>
              <div className="absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none text-[#333]">
                <CaretDown size={14} weight="regular" />
              </div>
            </div>
          </div>

          {/* Mensagem e Variáveis */}
          <div className="space-y-2 pt-2">
            <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Mensagem *</label>
            
            <div className="p-[12px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] space-y-3">
              <p className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-wide">Variáveis dinâmicas:</p>
              <div className="flex flex-wrap gap-2">
                {VARIABLES.map(v => (
                  <button
                    key={v.key}
                    onClick={() => insertVariable(v.key)}
                    type="button"
                    className="px-[9px] py-[4px] bg-[#0d2e29] border-[0.5px] border-accent-main/15 rounded-[5px] font-mono text-[9px] text-accent-main hover:bg-[#0d2e29]/80 transition-colors uppercase cursor-pointer"
                  >
                    {v.key}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value.toUpperCase())}
              maxLength={500}
              className="w-full h-[80px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] p-[13px] text-[12px] font-medium text-text-secondary placeholder:text-[#222] outline-none transition-all focus:border-accent-main/20 resize-none uppercase"
              placeholder="OLÁ {NOME}! SEU AGENDAMENTO..."
            />
            <p className="text-right text-[9px] text-[#2a2a2a] uppercase tracking-wide">{content.length}/500</p>
          </div>

          {/* Preview Ao Vivo */}
          <div className="p-4 bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] space-y-2">
            <p className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.12em]">Preview ao vivo</p>
            <div className="p-3 bg-bg-surface border-[0.5px] border-border-main rounded-[7px]">
              <p className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-wrap uppercase tracking-tight">
                {getPreview() || 'SUA MENSAGEM APARECERÁ AQUI...'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-[24px] py-[20px] border-t-[0.5px] border-border-main flex gap-[10px] bg-bg-surface">
          <button
            onClick={onClose}
            className="flex-1 py-[12px] rounded-[7px] border-[0.5px] border-border-main bg-bg-sidebar text-[#444] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:border-[#333] hover:text-[#777]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || name.length < 3 || content.length < 10}
            className="flex-[1.5] py-[12px] rounded-[7px] bg-accent-main text-black text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:opacity-90 disabled:opacity-20 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <CircleNotch size={14} className="animate-spin" />
            ) : (
              <FloppyDisk size={14} weight="bold" />
            )}
            SALVAR
          </button>
        </div>

      </div>
    </div>
  )
}
