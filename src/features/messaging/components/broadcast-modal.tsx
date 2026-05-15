'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { recordBroadcast } from '../actions'
import type { MessageTemplate } from '../types'
import { BROADCAST_GROUPS, type BroadcastGroup } from '../types'
import { X, Lightning, Eye, PaperPlaneRight, CheckCircle, CircleNotch } from '@phosphor-icons/react'

interface BroadcastModalProps {
  isOpen: boolean
  onClose: () => void
  orgName?: string
  templates: MessageTemplate[]
}

export function BroadcastModal({ isOpen, onClose, templates }: BroadcastModalProps) {
  const [selectedGroup, setSelectedGroup] = useState<BroadcastGroup | ''>('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [step, setStep] = useState<'config' | 'preview' | 'sending'>('config')
  const [isPending, startTransition] = useTransition()
  const [sentCount, setSentCount] = useState(0)

  const template = templates.find(t => t.id === selectedTemplateId)

  const handlePreview = () => {
    if (!selectedGroup || !selectedTemplateId) {
      toast.error('Selecione grupo e template')
      return
    }
    setStep('preview')
  }

  const handleSend = () => {
    if (!selectedGroup || !selectedTemplateId || !template) return

    startTransition(async () => {
      const fd = new FormData()
      fd.append('group', selectedGroup)
      fd.append('template_key', selectedTemplateId)
      fd.append('content', template.content)

      const res = await recordBroadcast(fd)
      if (res.error) {
        toast.error(res.error)
        return
      }

      setSentCount(res.sentCount ?? res.count ?? 0)
      setStep('sending')
      toast.success('DISPAROS ENVIADOS!')
    })
  }

  const handleClose = () => {
    setStep('config')
    setSelectedGroup('')
    setSelectedTemplateId('')
    setSentCount(0)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[480px] rounded-[12px] border border-border-main bg-bg-surface overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-[24px] pb-5 border-b-[0.5px] border-border-main">
          <div className="flex items-center gap-4">
            <div className="w-[32px] h-[32px] flex items-center justify-center bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] text-accent-main shrink-0">
              <Lightning size={18} weight="regular" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-[14px] font-medium text-text-primary uppercase tracking-tight">Disparo em Massa</h2>
              <p className="text-[9px] text-[#383838] font-medium uppercase tracking-[0.08em]">CONECTIVIDADE EXCLUSIVA VIA WHATSAPP</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-[26px] h-[26px] flex items-center justify-center bg-[#1a1a1a] border-[0.5px] border-[#252525] rounded-[6px] text-[#444] transition-all hover:text-text-primary"
          >
            <X size={12} weight="regular" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto px-[24px] py-[24px] custom-scrollbar">
          {step === 'sending' ? (
            <div className="flex flex-col items-center py-10 space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-[48px] h-[48px] rounded-full bg-[#25D366]/10 flex items-center justify-center border-[0.5px] border-[#25D366]/20">
                <CheckCircle size={24} weight="regular" className="text-[#25D366]" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[20px] font-medium text-text-primary uppercase tracking-tight">{sentCount} Mensagens</p>
                <p className="text-[#333] text-[9px] uppercase tracking-wide max-w-[240px] mx-auto leading-relaxed">
                  Os disparos foram iniciados com sucesso. O histórico já foi atualizado para auditoria.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="px-8 py-3 rounded-[7px] bg-bg-sidebar border-[0.5px] border-border-main text-[#444] text-[10px] font-medium uppercase tracking-widest hover:text-text-primary transition-all"
              >
                Finalizar
              </button>
            </div>
          ) : step === 'preview' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Preview da Estrutura</label>
                <div className="p-4 rounded-[7px] bg-bg-sidebar border-[0.5px] border-border-main space-y-4">
                  <p className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-wrap uppercase tracking-tight">{template?.content}</p>
                  <div className="pt-3 border-t border-border-main">
                    <p className="text-[8px] text-[#2a2a2a] uppercase tracking-wide leading-relaxed italic">
                      As chaves {'{nome}'}, {'{horario}'}, etc. serão injetadas dinamicamente com os dados de cada cliente no momento do disparo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 px-4 rounded-[7px] bg-bg-sidebar border-[0.5px] border-border-main space-y-1">
                  <p className="text-[8px] text-[#2a2a2a] uppercase tracking-wide">Público</p>
                  <p className="text-[10px] font-medium text-text-secondary uppercase">{BROADCAST_GROUPS.find(g => g.id === selectedGroup)?.label}</p>
                </div>
                <div className="p-3 px-4 rounded-[7px] bg-bg-sidebar border-[0.5px] border-border-main space-y-1">
                  <p className="text-[8px] text-[#2a2a2a] uppercase tracking-wide">Template</p>
                  <p className="text-[10px] font-medium text-text-secondary uppercase">{template?.name}</p>
                </div>
              </div>

              {/* Warning */}
              <div className="p-3 px-4 rounded-[7px] bg-[#2e1a0d]/10 border-[0.5px] border-[#c0700022] flex gap-3">
                <Lightning size={14} weight="fill" className="text-[#c07000] shrink-0" />
                <p className="text-[9px] text-[#c07000] uppercase tracking-wide leading-relaxed opacity-60">
                  As mensagens serão enviadas automaticamente via Evolution API. A variável {'{nome}'} será substituída pelo nome de cada cliente.
                </p>
              </div>

              <div className="flex gap-[10px] pt-4">
                <button
                  onClick={() => setStep('config')}
                  className="flex-1 py-[12px] rounded-[7px] border-[0.5px] border-border-main bg-bg-sidebar text-[#444] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:border-[#333] hover:text-[#777]"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSend}
                  disabled={isPending}
                  className="flex-[1.5] py-[12px] rounded-[7px] bg-[#25D366] text-black text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:opacity-90 disabled:opacity-20 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.1)]"
                >
                  {isPending ? (
                    <CircleNotch size={14} className="animate-spin" />
                  ) : (
                    <PaperPlaneRight size={14} weight="bold" />
                  )}
                  CONFIRMAR DISPARO
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              {/* Público */}
              <div className="space-y-4">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Segmentação de Público</label>
                <div className="grid grid-cols-2 gap-[6px]">
                  {BROADCAST_GROUPS.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGroup(g.id)}
                      className={cn(
                        'p-[14px_16px] rounded-[8px] border-[0.5px] text-left transition-all duration-300 text-[10px] font-medium uppercase tracking-[0.07em]',
                        selectedGroup === g.id
                          ? 'bg-[#0d2e29] border-accent-main/20 text-accent-main'
                          : 'bg-bg-sidebar border-border-main text-[#666] hover:bg-bg-surface hover:border-[#2a2a2a] hover:text-[#aaa]'
                      )}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template */}
              <div className="space-y-4">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Template de Alta Performance</label>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  {templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplateId(t.id)}
                      className={cn(
                        'w-full p-[12px_14px] min-h-[56px] rounded-[7px] border-[0.5px] text-left transition-all duration-300',
                        selectedTemplateId === t.id
                          ? 'border-accent-main/20 bg-[#0d2e29]/10'
                          : 'border-border-main bg-bg-sidebar hover:border-[#333]'
                      )}
                    >
                      <p className={cn(
                        "text-[11px] font-medium uppercase tracking-tight",
                        selectedTemplateId === t.id ? "text-accent-main" : "text-text-secondary"
                      )}>{t.name}</p>
                      <p className="text-[9px] text-[#333] mt-1 uppercase tracking-wide line-clamp-1">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePreview}
                disabled={!selectedGroup || !selectedTemplateId}
                className="w-full h-[48px] flex items-center justify-center gap-2 rounded-[7px] bg-accent-main text-black text-[10px] font-medium uppercase tracking-[0.1em] hover:opacity-90 transition-all disabled:opacity-20 shadow-[0_0_20px_color-mix(in_srgb,var(--accent)_10%,transparent)]"
              >
                <Eye size={16} weight="bold" />
                Validar Configuração
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
