'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { X } from '@phosphor-icons/react/dist/ssr'
import { createTemplate, updateTemplate } from '../actions'
import type { MessageTemplate } from '../types'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'

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
        setName(`${template.name} (cópia)`)
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
    
    // Set cursor position after variable
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
        toast.success(mode === 'edit' ? 'Template atualizado!' : 'Template criado!')
        onSuccess()
        onClose()
      }
    })
  }

  // Live preview substitutions
  const getPreview = () => {
    return content
      .replace(/\{nome\}/g, 'João Silva')
      .replace(/\{data\}/g, new Date(Date.now() + 86400000).toLocaleDateString('pt-BR'))
      .replace(/\{horario\}/g, '10:30')
      .replace(/\{servico\}/g, 'Corte + Barba')
      .replace(/\{barbeiro\}/g, 'Rafael')
      .replace(/\{valor\}/g, 'R$ 80,00')
      .replace(/\{link_agendamento\}/g, 'barbearia.com/agendar')
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/5 rounded-[16px] w-full max-w-[520px] max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
          <h2 className="font-syne font-bold text-2xl text-white tracking-tight">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="font-dm-mono text-[10px] uppercase tracking-widest text-muted-foreground">Nome do Template *</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={60}
                placeholder="Ex: Lembrete de Agendamento"
                className="bg-[#0a0a0a] border-white/5 rounded-[8px] h-12"
              />
              <p className="text-right text-xs text-muted-foreground">{name.length}/60</p>
            </div>

            <div className="space-y-1.5">
              <label className="font-dm-mono text-[10px] uppercase tracking-widest text-muted-foreground">Descrição</label>
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={100}
                placeholder="Ex: Enviado 1 dia antes do horário"
                className="bg-[#0a0a0a] border-white/5 rounded-[8px] h-12"
              />
              <p className="text-right text-xs text-muted-foreground">{description.length}/100</p>
            </div>

            <div className="space-y-1.5">
              <label className="font-dm-mono text-[10px] uppercase tracking-widest text-muted-foreground">Tipo de Disparo</label>
              <select
                value={triggerType}
                onChange={e => setTriggerType(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-[8px] h-12 px-3 text-sm text-white focus:outline-none focus:border-accent-cyan"
              >
                <option value="manual">Manual (Enviado pelo admin)</option>
                <option value="reminder">Lembrete (1 dia antes)</option>
                <option value="confirmation">Confirmação (Ao agendar)</option>
                <option value="birthday">Aniversário (Dia do aniversário)</option>
                <option value="loyalty">Fidelidade (Ao completar carimbos)</option>
                <option value="reactivation">Reativação (+30 dias sem visita)</option>
              </select>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="font-dm-mono text-[10px] uppercase tracking-widest text-muted-foreground">Mensagem *</label>
              
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-3">
                <p className="text-xs text-muted-foreground">Variáveis disponíveis (Clique para inserir):</p>
                <div className="flex flex-wrap gap-2">
                  {VARIABLES.map(v => (
                    <button
                      key={v.key}
                      onClick={() => insertVariable(v.key)}
                      type="button"
                      className="px-2 py-1 bg-[#1a1a1a] border border-white/10 rounded font-dm-mono text-xs text-accent-cyan hover:bg-white/10 transition-colors"
                    >
                      {v.key}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                maxLength={500}
                rows={5}
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-accent-cyan resize-none mt-2"
                placeholder="Olá {nome}! Seu agendamento..."
              />
              <p className="text-right text-xs text-muted-foreground">{content.length}/500</p>
            </div>

            <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-xl space-y-2">
              <p className="font-dm-mono text-[10px] text-accent-cyan uppercase tracking-widest">Preview Ao Vivo</p>
              <div className="p-4 bg-[#111] border border-white/5 rounded-xl">
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                  {getPreview() || 'Sua mensagem aparecerá aqui...'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || name.length < 3 || content.length < 10}
            className="flex-[2] py-3 rounded-full bg-accent-cyan text-black text-sm font-bold hover:bg-accent-cyan/90 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Salvando...' : 'Salvar template'}
          </button>
        </div>

      </div>
    </div>
  )
}
