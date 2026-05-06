'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { recordMessage } from '../actions'
import type { ClientForMessage } from '../types'
import { TEMPLATES, type TemplateKey } from '../types'
import { X } from '@phosphor-icons/react/dist/ssr'
import { Input } from '@/components/ui/input'

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  clients: ClientForMessage[]
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

export function TemplateModal({ isOpen, onClose, clients, orgName }: TemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey | ''>('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const template = TEMPLATES.find(t => t.key === selectedTemplate)
  const selectedClient = clients.find(c => c.id === selectedClientId)

  const filteredClients = clientSearch.length >= 1
    ? clients.filter(c =>
        c.full_name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.phone || '').includes(clientSearch)
      )
    : []

  const preview = template && selectedClient
    ? applyTemplateVars(template.content, selectedClient, orgName)
    : null

  const handleSend = () => {
    if (!template || !selectedClient) {
      toast.error('Selecione cliente e template')
      return
    }
    if (!selectedClient.phone) {
      toast.error('Este cliente não tem telefone')
      return
    }

    startTransition(async () => {
      const content = applyTemplateVars(template.content, selectedClient, orgName)
      sendWhatsApp(selectedClient.phone!, content)

      const fd = new FormData()
      fd.append('client_id', selectedClient.id)
      fd.append('content', content)
      fd.append('template_used', template.key)
      const res = await recordMessage(fd)
      if (res.error) toast.error(res.error)
      else {
        toast.success('Template enviado e registrado!')
        onClose()
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-syne font-bold text-white uppercase tracking-tight">Enviar Template</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Cliente */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cliente</label>
            {selectedClient ? (
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-white">{selectedClient.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedClient.phone || 'Sem telefone'}</p>
                </div>
                <button onClick={() => setSelectedClientId('')} className="text-xs text-red-400 hover:text-red-300">Trocar</button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  placeholder="Buscar cliente..."
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
                {filteredClients.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
                    {filteredClients.map(c => (
                      <button
                        key={c.id}
                        className="w-full text-left px-4 py-3 hover:bg-white/5"
                        onClick={() => { setSelectedClientId(c.id); setClientSearch('') }}
                      >
                        <p className="text-sm font-medium text-white">{c.full_name}</p>
                        <p className="text-xs text-muted-foreground">{c.phone || 'Sem telefone'}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Template */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Template</label>
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

          {/* Preview */}
          {preview && (
            <div className="p-3 rounded-xl bg-[#25D366]/5 border border-[#25D366]/20 space-y-1">
              <p className="text-[10px] font-bold text-[#25D366] uppercase tracking-widest">Preview</p>
              <p className="text-sm text-white leading-relaxed">{preview}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 text-white text-sm font-bold hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={isPending || !selectedClient || !selectedTemplate}
              className="flex-[2] py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:bg-[#25D366]/90 transition-colors disabled:opacity-40"
            >
              {isPending ? 'Enviando...' : 'Enviar via WhatsApp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
