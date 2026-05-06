'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { recordBroadcast } from '../actions'
import type { ClientForMessage } from '../types'
import { TEMPLATES, BROADCAST_GROUPS, type BroadcastGroup, type TemplateKey } from '../types'
import { X, Lightning, Users, Eye, PaperPlaneRight } from '@phosphor-icons/react/dist/ssr'

interface BroadcastModalProps {
  isOpen: boolean
  onClose: () => void
  orgName: string
}

function applyTemplateVars(content: string, client: ClientForMessage, orgName: string): string {
  return content
    .replace(/\[NOME\]/g, client.full_name)
    .replace(/\[NOME_BARBEARIA\]/g, orgName)
    .replace(/\[DATA\]/g, new Date().toLocaleDateString('pt-BR'))
    .replace(/\[HORA\]/g, new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    .replace(/\[BARBEIRO\]/g, 'seu barbeiro')
}

function sendWhatsApp(phone: string, message: string) {
  const clean = phone.replace(/\D/g, '')
  const url = `https://wa.me/55${clean}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

export function BroadcastModal({ isOpen, onClose, orgName }: BroadcastModalProps) {
  const [selectedGroup, setSelectedGroup] = useState<BroadcastGroup | ''>('')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey | ''>('')
  const [step, setStep] = useState<'config' | 'preview' | 'sending'>('config')
  const [isPending, startTransition] = useTransition()
  const [sentCount, setSentCount] = useState(0)

  const template = TEMPLATES.find(t => t.key === selectedTemplate)

  const handlePreview = () => {
    if (!selectedGroup || !selectedTemplate) {
      toast.error('Selecione grupo e template')
      return
    }
    setStep('preview')
  }

  const handleSend = () => {
    if (!selectedGroup || !selectedTemplate || !template) return

    startTransition(async () => {
      const fd = new FormData()
      fd.append('group', selectedGroup)
      fd.append('template_key', selectedTemplate)
      fd.append('content', template.content)

      const res = await recordBroadcast(fd)
      if (res.error) {
        toast.error(res.error)
        return
      }

      const clients = (res.clients || []) as ClientForMessage[]

      // Open WhatsApp for each client with phone
      let count = 0
      for (const client of clients) {
        if (client.phone) {
          const msg = applyTemplateVars(template.content, client, orgName)
          sendWhatsApp(client.phone, msg)
          count++
          // Small delay to avoid browser blocking
          await new Promise(r => setTimeout(r, 400))
        }
      }

      setSentCount(count)
      setStep('sending')
      toast.success(`${count} mensagens disparadas!`)
    })
  }

  const handleClose = () => {
    setStep('config')
    setSelectedGroup('')
    setSelectedTemplate('')
    setSentCount(0)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-[#141414] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
              <Lightning size={20} weight="duotone" className="text-accent-cyan" />
            </div>
            <div>
              <h2 className="font-syne font-bold text-white uppercase tracking-tight">Disparo em Massa</h2>
              <p className="text-xs text-muted-foreground">WhatsApp · Todos os números com telefone</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {step === 'sending' ? (
            <div className="flex flex-col items-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <p className="text-2xl font-bold font-syne text-white">{sentCount} mensagens</p>
              <p className="text-muted-foreground text-sm text-center">
                Os links do WhatsApp foram abertos em novas abas.<br />
                O envio foi registrado no histórico.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 rounded-xl bg-white/5 text-white text-sm font-bold hover:bg-white/10 transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : step === 'preview' ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Preview da Mensagem</p>
                <p className="text-sm text-white leading-relaxed">{template?.content}</p>
                <p className="text-xs text-muted-foreground italic">
                  [NOME], [HORA], etc. serão substituídos por dados reais de cada cliente.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users size={16} weight="duotone" />
                <span>Grupo: <strong className="text-white">{BROADCAST_GROUPS.find(g => g.id === selectedGroup)?.label ?? 'Não selecionado'}</strong></span>
              </div>
              <p className="text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/20 rounded-xl p-3">
                ⚠️ O WhatsApp será aberto para <strong>cada cliente com telefone</strong> em sequência. Pode haver bloqueio após muitas abas. Recomendado: até 20 clientes por vez.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('config')}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-white text-sm font-bold hover:bg-white/10 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSend}
                  disabled={isPending}
                  className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:bg-[#25D366]/90 transition-colors disabled:opacity-50"
                >
                  <PaperPlaneRight size={18} weight="bold" />
                  {isPending ? 'Disparando...' : 'Disparar Mensagens'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Group */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Grupo de Clientes</label>
                <div className="grid grid-cols-2 gap-2">
                  {BROADCAST_GROUPS.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGroup(g.id)}
                      className={cn(
                        'p-3 rounded-xl border text-left transition-all text-sm',
                        selectedGroup === g.id
                          ? 'border-accent-cyan/50 bg-accent-cyan/5 text-white'
                          : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20'
                      )}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Template de Mensagem</label>
                <div className="space-y-2">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setSelectedTemplate(t.key)}
                      className={cn(
                        'w-full p-3 rounded-xl border text-left transition-all',
                        selectedTemplate === t.key
                          ? 'border-accent-cyan/50 bg-accent-cyan/5'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      )}
                    >
                      <p className="text-sm font-bold text-white">{t.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePreview}
                disabled={!selectedGroup || !selectedTemplate}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-cyan text-black font-bold uppercase tracking-wider text-sm hover:bg-accent-cyan/90 transition-colors disabled:opacity-40"
              >
                <Eye size={18} weight="bold" />
                Pré-visualizar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
