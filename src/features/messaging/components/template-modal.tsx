'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { recordMessage, duplicateTemplate } from '../actions'
import type { ClientForMessage, MessageTemplate } from '../types'
import { X, Plus, DotsThreeVertical, PencilSimple, Copy, Trash, Lock, PaperPlaneRight, MagnifyingGlass, CircleNotch } from '@phosphor-icons/react'
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
        toast.success('TEMPLATE ENVIADO!')
        onClose()
      }
    })
  }

  const handleDuplicate = (t: MessageTemplate) => {
    startTransition(async () => {
      const res = await duplicateTemplate(t.id)
      if (res.error) toast.error(res.error)
      else {
        toast.success('DUPLICADO!')
        onRefresh()
      }
    })
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                <PaperPlaneRight size={18} weight="regular" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-[14px] font-medium text-text-primary uppercase tracking-tight">Enviar Template</h2>
                <p className="text-[9px] text-[#383838] font-medium uppercase tracking-[0.08em]">Selecione cliente e mensagem</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-[26px] h-[26px] flex items-center justify-center bg-[#1a1a1a] border-[0.5px] border-[#252525] rounded-[6px] text-[#444] transition-all hover:text-text-primary"
            >
              <X size={12} weight="regular" />
            </button>
          </div>

          {/* Form Content */}
          <div className="overflow-y-auto px-[24px] py-[24px] space-y-6 custom-scrollbar">
            {/* Cliente */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Cliente</label>
              
              {selectedClient ? (
                <div className="flex items-center justify-between p-3 px-4 bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px]">
                  <div className="flex items-center gap-3">
                    <div className="w-[32px] h-[32px] rounded-[8px] bg-[#1a1a2e] flex items-center justify-center text-[#8b7cf6] text-[11px] font-medium uppercase">
                      {selectedClient.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-text-secondary uppercase">{selectedClient.full_name}</p>
                      <p className="text-[9px] text-[#2a2a2a] uppercase tracking-wider">{selectedClient.phone || 'Sem telefone'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedClientId('')} 
                    className="text-[9px] font-medium text-[#444] uppercase tracking-[0.08em] hover:text-text-primary transition-colors"
                  >
                    Trocar
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#2e2e2e]" />
                  <input
                    placeholder="BUSCAR CLIENTE..."
                    value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                    className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] py-[10px] pl-9 pr-3 text-[11px] text-text-secondary placeholder:text-[#2e2e2e] outline-none transition-all focus:border-accent-main/20 uppercase"
                  />
                  {filteredClients.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] shadow-2xl z-[110] max-h-48 overflow-y-auto overflow-hidden custom-scrollbar">
                      {filteredClients.map(c => (
                        <button
                          key={c.id}
                          className="w-full text-left px-4 py-3 hover:bg-bg-surface flex items-center justify-between group transition-colors border-b-[0.5px] border-border-main/50 last:border-0"
                          onClick={() => { setSelectedClientId(c.id); setClientSearch('') }}
                        >
                          <div>
                            <p className="text-[11px] font-medium text-text-secondary group-hover:text-accent-main transition-colors uppercase">{c.full_name}</p>
                            <p className="text-[9px] text-[#2a2a2a] mt-0.5 uppercase tracking-wide">{c.phone || 'Sem telefone'}</p>
                          </div>
                          <Plus size={14} className="text-[#1a1a1a] group-hover:text-text-primary" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Template */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Template</label>
                <button 
                  onClick={() => setEditorState({ isOpen: true, mode: 'create', template: null })}
                  className="flex items-center gap-1.5 text-[9px] font-medium text-accent-main uppercase tracking-[0.12em] hover:opacity-80 transition-opacity"
                >
                  <Plus size={12} weight="bold" />
                  Novo Template
                </button>
              </div>

              <div className="space-y-2">
                {templates.map(t => (
                  <div
                    key={t.id}
                    className={cn(
                      'relative group rounded-[7px] border-[0.5px] transition-all duration-300',
                      selectedTemplateId === t.id
                        ? 'border-accent-main/20 bg-[#0d2e1a]/10'
                        : 'border-border-main bg-bg-sidebar hover:border-[#333]'
                    )}
                  >
                    <button
                      onClick={() => setSelectedTemplateId(t.id)}
                      className="w-full p-3 px-4 text-left pr-12"
                    >
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "text-[11px] font-medium uppercase tracking-tight",
                          selectedTemplateId === t.id ? "text-accent-main" : "text-text-secondary"
                        )}>{t.name}</p>
                        {t.is_system && <Lock size={10} weight="fill" className="text-[#2a2a2a]" />}
                      </div>
                      <p className="text-[9px] text-[#333] mt-1 uppercase tracking-wide line-clamp-1">{t.description}</p>
                    </button>

                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-8 h-8 rounded-[6px] flex items-center justify-center hover:bg-bg-surface text-[#222] hover:text-text-nav transition-colors">
                            <DotsThreeVertical size={20} weight="bold" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-bg-surface border-border-main rounded-[8px] shadow-2xl p-1.5">
                          <DropdownMenuItem 
                            onClick={() => setEditorState({ isOpen: true, mode: 'edit', template: t })}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-[10px] text-text-secondary hover:bg-[#1a1a1a] cursor-pointer uppercase font-medium tracking-wide"
                          >
                            <PencilSimple size={14} />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDuplicate(t)}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-[10px] text-text-secondary hover:bg-[#1a1a1a] cursor-pointer uppercase font-medium tracking-wide"
                          >
                            <Copy size={14} />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#1e1e1e] my-1" />
                          <DropdownMenuItem 
                            disabled={t.is_system}
                            onClick={() => setDeleteState({ isOpen: true, template: t })}
                            className={cn(
                              "flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-[10px] cursor-pointer uppercase font-medium tracking-wide",
                              t.is_system ? "opacity-20 grayscale cursor-not-allowed" : "text-red-900 hover:bg-red-900/10"
                            )}
                          >
                            <Trash size={14} />
                            Deletar
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
              <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-bottom-2">
                <label className="text-[9px] font-medium text-accent-main uppercase tracking-[0.12em]">Preview Final</label>
                <div className="p-4 rounded-[7px] bg-bg-sidebar border-[0.5px] border-border-main relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-[#25D366]/20" />
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                    <span className="text-[8px] font-medium text-[#25D366] uppercase tracking-widest">WhatsApp Simulator</span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-wrap uppercase tracking-tight">{preview}</p>
                </div>
              </div>
            )}
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
              onClick={handleSend}
              disabled={isPending || !selectedClient || !template}
              className="flex-[1.5] py-[12px] rounded-[7px] bg-accent-main text-black text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:opacity-90 disabled:opacity-20 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <CircleNotch size={14} className="animate-spin" />
              ) : (
                <PaperPlaneRight size={14} weight="bold" />
              )}
              ENVIAR
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
