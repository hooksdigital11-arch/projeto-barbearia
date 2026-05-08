'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { recordBroadcast } from '../actions'
import type { ClientForMessage, MessageTemplate } from '../types'
import { BROADCAST_GROUPS, type BroadcastGroup } from '../types'
import { X, Lightning, Users, Eye, PaperPlaneRight, CheckCircle } from '@phosphor-icons/react/dist/ssr'

interface BroadcastModalProps {
  isOpen: boolean
  onClose: () => void
  orgName: string
  templates: MessageTemplate[]
}

function applyTemplateVars(content: string, client: ClientForMessage, orgName: string): string {
  return content
    .replace(/\{nome\}/g, client.full_name)
    .replace(/\{nome_barbearia\}/g, orgName)
    .replace(/\{data\}/g, new Date().toLocaleDateString('pt-BR'))
    .replace(/\{horario\}/g, new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    .replace(/\{servico\}/g, 'serviço')
    .replace(/\{barbeiro\}/g, 'seu barbeiro')
    .replace(/\{valor\}/g, 'R$ 0,00')
    .replace(/\{link_agendamento\}/g, 'barbearia.com')
}

function sendWhatsApp(phone: string, message: string) {
  const clean = phone.replace(/\D/g, '')
  const url = `https://wa.me/55${clean}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

export function BroadcastModal({ isOpen, onClose, orgName, templates }: BroadcastModalProps) {
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

      const clients = (res.clients || []) as ClientForMessage[]

      // Open WhatsApp for each client with phone
      let count = 0
      for (const client of clients) {
        if (client.phone) {
          const msg = applyTemplateVars(template.content, client, orgName)
          sendWhatsApp(client.phone, msg)
          count++
          // Small delay to avoid browser blocking
          await new Promise(r => setTimeout(r, 600))
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
    setSelectedTemplateId('')
    setSentCount(0)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95" onClick={handleClose} />
      <div className="relative bg-[#0a0a0a] border border-white/5 rounded-[24px] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 flex items-center justify-center">
              <Lightning size={24} weight="duotone" className="text-accent-cyan" />
            </div>
            <div>
              <h2 className="font-syne font-bold text-2xl text-white uppercase tracking-tight">Disparo em Massa</h2>
              <p className="text-[10px] font-dm-mono text-muted-foreground uppercase tracking-widest mt-1">Conectividade Exclusiva via WhatsApp</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto scrollbar-hide">
          {step === 'sending' ? (
            <div className="flex flex-col items-center py-12 space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-24 h-24 rounded-full bg-[#25D366]/10 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-20" />
                <CheckCircle size={48} weight="duotone" className="text-[#25D366]" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-3xl font-bold font-syne text-white tracking-tighter">{sentCount} Mensagens</p>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Os disparos foram iniciados com sucesso. O histórico já foi atualizado para auditoria.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="px-10 py-4 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl active:scale-95"
              >
                Finalizar
              </button>
            </div>
          ) : step === 'preview' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <label className="font-dm-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Preview da Estrutura</label>
                <div className="p-6 rounded-2xl bg-[#111] border border-white/5 space-y-4">
                  <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{template?.content}</p>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] font-dm-mono text-accent-cyan/50 uppercase italic leading-relaxed">
                      As chaves {'{nome}'}, {'{horario}'}, etc. serão injetadas dinamicamente com os dados de cada cliente no momento do disparo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <p className="text-[10px] font-dm-mono text-muted-foreground uppercase">Alvo</p>
                  <p className="text-sm font-bold text-white">{BROADCAST_GROUPS.find(g => g.id === selectedGroup)?.label}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <p className="text-[10px] font-dm-mono text-muted-foreground uppercase">Template</p>
                  <p className="text-sm font-bold text-white">{template?.name}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-4">
                <div className="shrink-0 text-amber-500">
                  <Lightning size={20} weight="fill" />
                </div>
                <p className="text-xs text-amber-200/60 leading-relaxed">
                  O sistema abrirá o WhatsApp Web para cada cliente. Recomendamos manter a janela visível e evitar disparos superiores a 30 contatos para mitigar riscos de spam.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep('config')}
                  className="flex-1 py-4 rounded-full border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSend}
                  disabled={isPending}
                  className="flex-[2] flex items-center justify-center gap-3 py-4 rounded-full bg-[#25D366] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#25D366]/90 transition-all shadow-[0_0_30px_rgba(37,211,102,0.2)] active:scale-95 disabled:opacity-30"
                >
                  <PaperPlaneRight size={18} weight="bold" />
                  {isPending ? 'Iniciando Disparos...' : 'Confirmar Disparo'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              {/* Group */}
              <div className="space-y-4">
                <label className="font-dm-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Segmentação de Público</label>
                <div className="grid grid-cols-2 gap-3">
                  {BROADCAST_GROUPS.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGroup(g.id)}
                      className={cn(
                        'p-5 rounded-2xl border text-left transition-all duration-300',
                        selectedGroup === g.id
                          ? 'border-accent-cyan bg-accent-cyan/5 text-white'
                          : 'border-white/5 bg-[#111] text-muted-foreground hover:border-white/10 hover:text-white'
                      )}
                    >
                      <p className="text-xs font-bold uppercase tracking-widest">{g.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template */}
              <div className="space-y-4">
                <label className="font-dm-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Template de Alta Performance</label>
                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 scrollbar-hide">
                  {templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplateId(t.id)}
                      className={cn(
                        'w-full p-5 rounded-2xl border text-left transition-all duration-300',
                        selectedTemplateId === t.id
                          ? 'border-accent-cyan bg-accent-cyan/5'
                          : 'border-white/5 bg-[#111] hover:border-white/10'
                      )}
                    >
                      <p className="text-sm font-bold text-white">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1 opacity-60">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePreview}
                disabled={!selectedGroup || !selectedTemplateId}
                className="w-full h-16 flex items-center justify-center gap-3 rounded-full bg-accent-cyan text-black font-black uppercase tracking-widest text-xs hover:bg-accent-cyan/90 transition-all shadow-[0_10px_30px_rgba(0,229,255,0.2)] active:scale-[0.98] disabled:opacity-20"
              >
                <Eye size={20} weight="bold" />
                Validar Configuração
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

