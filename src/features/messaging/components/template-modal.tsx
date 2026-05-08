'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { recordMessage, duplicateTemplate } from '../actions'
import type { ClientForMessage, MessageTemplate } from '../types'
import { X, Plus, DotsThreeVertical, PencilSimple, Copy, Trash, Lock } from '@phosphor-icons/react/dist/ssr'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { TemplateEditorModal } from './template-editor-modal'
import { TemplateDeleteConfirm } from './template-delete-confirm'

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  clients: ClientForMessage[]
  templates: MessageTemplate[]
  orgName: string
  onRefresh: () => void
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

export function TemplateModal({ isOpen, onClose, clients, templates, orgName, onRefresh }: TemplateModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  // Editor State
  const [editorState, setEditorState] = useState<{
    isOpen: boolean
    mode: 'create' | 'edit' | 'duplicate'
    template: MessageTemplate | null
  }>({ isOpen: false, mode: 'create', template: null })

  // Delete State
  const [deleteState, setDeleteState] = useState<{
    isOpen: boolean
    template: MessageTemplate | null
  }>({ isOpen: false, template: null })

  const template = templates.find(t => t.id === selectedTemplateId)
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
      fd.append('template_used', template.id)
      const res = await recordMessage(fd)
      if (res.error) toast.error(res.error)
      else {
        toast.success('Template enviado e registrado!')
        onClose()
      }
    })
  }

  const handleDuplicate = (t: MessageTemplate) => {
    startTransition(async () => {
      const res = await duplicateTemplate(t.id)
      if (res.error) toast.error(res.error)
      else {
        toast.success('Template duplicado!')
        onRefresh()
      }
    })
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/90" onClick={onClose} />
        <div className="relative bg-[#0a0a0a] border border-white/5 rounded-[20px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between shrink-0">
            <div>
              <h2 className="font-syne font-bold text-2xl text-white uppercase tracking-tight">Enviar Template</h2>
              <p className="text-[10px] font-dm-mono text-muted-foreground uppercase tracking-[0.2em] mt-1">Selecione cliente e mensagem</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
            {/* Cliente Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-dm-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cliente</label>
              </div>

              {selectedClient ? (
                <div className="flex items-center justify-between p-4 bg-[#111] border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent-cyan/10 flex items-center justify-center text-accent-cyan font-bold">
                      {selectedClient.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">{selectedClient.full_name}</p>
                      <p className="font-dm-mono text-xs text-muted-foreground">{selectedClient.phone || 'Sem telefone'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedClientId('')} 
                    className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white hover:bg-white/5 transition-colors"
                  >
                    Trocar
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Buscar cliente pelo nome ou telefone..."
                    value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                    className="bg-[#111] border-white/5 h-14 rounded-2xl px-6 font-dm-sans placeholder:text-muted-foreground/30"
                  />
                  {filteredClients.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto border-t-0 overflow-hidden">
                      {filteredClients.map(c => (
                        <button
                          key={c.id}
                          className="w-full text-left px-6 py-4 hover:bg-white/5 flex items-center justify-between group transition-colors"
                          onClick={() => { setSelectedClientId(c.id); setClientSearch('') }}
                        >
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-accent-cyan transition-colors">{c.full_name}</p>
                            <p className="font-dm-mono text-xs text-muted-foreground mt-0.5">{c.phone || 'Sem telefone'}</p>
                          </div>
                          <Plus size={16} className="text-muted-foreground group-hover:text-white" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Template Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-dm-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Template</label>
                <button 
                  onClick={() => setEditorState({ isOpen: true, mode: 'create', template: null })}
                  className="flex items-center gap-2 text-[10px] font-bold text-accent-cyan uppercase tracking-widest hover:opacity-80 transition-opacity"
                >
                  <Plus size={14} weight="bold" />
                  Novo Template
                </button>
              </div>

              <div className="grid gap-3">
                {templates.map(t => (
                  <div
                    key={t.id}
                    className={cn(
                      'relative group rounded-2xl border transition-all duration-300',
                      selectedTemplateId === t.id
                        ? 'border-accent-cyan bg-accent-cyan/5'
                        : 'border-white/5 bg-[#111] hover:border-white/10'
                    )}
                  >
                    <button
                      onClick={() => setSelectedTemplateId(t.id)}
                      className="w-full p-5 text-left pr-14"
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{t.name}</p>
                        {t.is_system && <Lock size={12} weight="fill" className="text-muted-foreground/50" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed opacity-70">{t.description}</p>
                    </button>

                    {/* Actions Dropdown */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
                            <DotsThreeVertical size={24} weight="bold" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#1a1a1a] border-white/5 rounded-xl shadow-2xl p-2">
                          <DropdownMenuItem 
                            onClick={() => setEditorState({ isOpen: true, mode: 'edit', template: t })}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white hover:bg-white/5 cursor-pointer"
                          >
                            <PencilSimple size={18} />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDuplicate(t)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white hover:bg-white/5 cursor-pointer"
                          >
                            <Copy size={18} />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5 my-1" />
                          <DropdownMenuItem 
                            disabled={t.is_system}
                            onClick={() => setDeleteState({ isOpen: true, template: t })}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer",
                              t.is_system ? "opacity-30 grayscale" : "text-red-400 hover:bg-red-500/10"
                            )}
                          >
                            <Trash size={18} />
                            {t.is_system ? 'Bloqueado' : 'Deletar'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Section */}
            {preview && (
              <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-2">
                <label className="font-dm-mono text-[10px] font-bold text-accent-cyan uppercase tracking-widest">Preview Final</label>
                <div className="p-6 rounded-2xl bg-[#111] border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#25D366] shadow-[0_0_8px_#25D366]" />
                    <span className="text-[10px] font-dm-mono text-[#25D366] uppercase tracking-widest">Simulação WhatsApp</span>
                  </div>
                  <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{preview}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-white/5 flex gap-4 bg-[#0a0a0a] shrink-0">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-full border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={isPending || !selectedClient || !template}
              className="flex-[2] py-4 rounded-full bg-accent-cyan text-black text-sm font-bold hover:bg-accent-cyan/90 transition-all disabled:opacity-30 shadow-[0_0_20px_rgba(0,229,255,0.15)] active:scale-[0.98]"
            >
              {isPending ? 'ENVIANDO...' : 'ENVIAR VIA WHATSAPP'}
            </button>
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      <TemplateEditorModal 
        isOpen={editorState.isOpen}
        onClose={() => setEditorState({ ...editorState, isOpen: false })}
        mode={editorState.mode}
        template={editorState.template}
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation */}
      <TemplateDeleteConfirm 
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState({ ...deleteState, isOpen: false })}
        template={deleteState.template}
        onSuccess={onRefresh}
      />
    </>
  )
}

