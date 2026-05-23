'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { sendMessageAction } from '../actions'
import type { Message, MessageConversation, ClientForMessage } from '../types'
import { 
  PaperPlaneRight, 
  MagnifyingGlass, 
  ChatCircleText,
  CaretLeft
} from '@phosphor-icons/react'

interface ConversationPanelProps {
  conversations: MessageConversation[]
  allClients: ClientForMessage[]
  selectedClientId: string | null
  onSelectClient: (clientId: string, name: string, phone: string | null) => void
}

export function ConversationPanel({
  conversations,
  allClients,
  selectedClientId,
  onSelectClient,
}: ConversationPanelProps) {
  const [search, setSearch] = useState('')

  const filtered = search.length >= 1
    ? allClients.filter(c =>
        c.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || '').includes(search)
      )
    : null

  return (
    <div className="flex flex-col h-full bg-bg-sidebar">
      {/* Search Header */}
      <div className="p-4 border-b-[0.5px] border-border-main">
        <label className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.12em] block mb-3">Conversas Ativas</label>
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#2e2e2e]" />
          <input
            placeholder="BUSCAR CLIENTE..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-bg-black border-[0.5px] border-border-main rounded-[7px] py-2 pl-9 pr-3 text-[10px] text-text-secondary placeholder:text-[#2e2e2e] outline-none transition-all focus:border-[#333]"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filtered ? (
          filtered.map(c => (
            <button
              key={c.id}
              onClick={() => onSelectClient(c.id, c.full_name, c.phone)}
              className={cn(
                'w-full text-left flex items-start gap-[10px] px-4 py-3 border-b-[0.5px] border-border-main transition-all hover:bg-bg-surface',
                selectedClientId === c.id && 'bg-bg-surface border-l-2 border-l-accent-main'
              )}
            >
              <div className="w-[32px] h-[32px] rounded-[8px] bg-[#1a1a2e] flex items-center justify-center text-[#8b7cf6] text-[11px] font-medium uppercase shrink-0">
                {c.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-text-secondary truncate">{c.full_name}</p>
                <p className="text-[10px] text-[#2e2e2e] truncate uppercase tracking-tight">{c.phone || 'Sem telefone'}</p>
              </div>
            </button>
          ))
        ) : (
          conversations.map(conv => (
            <button
              key={conv.client_id}
              onClick={() => onSelectClient(conv.client_id, conv.client_name, conv.client_phone)}
              className={cn(
                'w-full text-left flex items-start gap-[10px] px-4 py-3 border-b-[0.5px] border-border-main transition-all hover:bg-bg-surface',
                selectedClientId === conv.client_id && 'bg-bg-surface border-l-2 border-l-accent-main'
              )}
            >
              <div className="w-[32px] h-[32px] rounded-[8px] bg-[#1a1a2e] flex items-center justify-center text-[#8b7cf6] text-[11px] font-medium uppercase shrink-0">
                {conv.client_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <p className="text-[11px] font-medium text-text-secondary truncate">{conv.client_name}</p>
                  <span className="text-[9px] text-[#2a2a2a] shrink-0 uppercase">
                    {new Date(conv.last_message_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
                <p className="text-[10px] text-[#2e2e2e] truncate uppercase tracking-tight leading-tight mt-0.5">
                  {conv.last_message}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

interface ChatPanelProps {
  messages: Message[]
  clientId: string
  clientName: string
  clientPhone: string | null
  onBack?: () => void
}

export function ChatPanel({ messages, clientId, clientName, clientPhone, onBack }: ChatPanelProps) {
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!text.trim()) return
    if (!clientPhone) {
      toast.error('Este cliente não tem telefone cadastrado.')
      return
    }

    const content = text.trim()
    startTransition(async () => {
      const fd = new FormData()
      fd.append('client_id', clientId)
      fd.append('content', content)
      const res = await sendMessageAction(fd)
      if (res.error) toast.error(res.error)
      else {
        setText('')
        toast.success('ENVIADA!')
      }
    })
  }

  return (
    <div className="flex flex-col h-full bg-bg-sidebar">
      {/* Header */}
      <div className="px-5 py-4 border-b-[0.5px] border-border-main flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden w-11 h-11 flex items-center justify-center text-text-secondary hover:text-text-primary rounded-full hover:bg-white/5 transition-all shrink-0"
              aria-label="Voltar para lista de conversas"
            >
              <CaretLeft size={20} weight="bold" />
            </button>
          )}
          <div className="w-[32px] h-[32px] rounded-[8px] bg-[#1a1a2e] flex items-center justify-center text-[#8b7cf6] text-[11px] font-medium uppercase shrink-0">
            {clientName.charAt(0)}
          </div>
          <div>
            <p className="text-[11px] font-medium text-text-secondary uppercase">{clientName}</p>
            <p className="text-[9px] text-[#2a2a2a] flex items-center gap-1 uppercase tracking-wider">
              {clientPhone || 'Sem telefone'}
            </p>
          </div>
        </div>
        
        {clientPhone && (
          <a
            href={`https://wa.me/55${clientPhone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#25D366]/5 text-[#25D366] text-[9px] font-medium uppercase tracking-[0.05em] transition-all hover:bg-[#25D366]/10"
          >
            WhatsApp
          </a>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 grayscale">
            <ChatCircleText size={32} weight="regular" className="mb-3" />
            <p className="text-[10px] uppercase tracking-[0.08em]">Sem mensagens</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={cn(
                'flex',
                msg.direction === 'sent' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] px-4 py-3 rounded-[12px] text-[11px] leading-relaxed',
                  msg.direction === 'sent'
                    ? 'bg-accent-main text-black rounded-tr-none'
                    : 'bg-bg-surface border-[0.5px] border-border-main text-text-secondary rounded-tl-none'
                )}
              >
                <p className="uppercase tracking-tight">{msg.content}</p>
                <div className={cn(
                  'flex items-center gap-2 mt-2',
                  msg.direction === 'sent' ? 'justify-end' : 'justify-start'
                )}>
                  <span className={cn('text-[8px] uppercase', msg.direction === 'sent' ? 'text-black/60' : 'text-[#2a2a2a]')} suppressHydrationWarning>
                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.template_used && (
                    <span className="text-[8px] px-1 rounded bg-black/5 uppercase tracking-tighter opacity-50">TEMPLATE</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t-[0.5px] border-border-main">
        <div className="flex gap-2">
          <input
            placeholder="DIGITE UMA MENSAGEM..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend() }}
            className="flex-1 bg-bg-black border-[0.5px] border-border-main rounded-[8px] px-4 py-3 min-h-[44px] text-[11px] text-text-secondary outline-none transition-all focus:border-[#333] uppercase placeholder:text-[#222]"
            disabled={isPending || !clientPhone}
          />
          <button
            onClick={handleSend}
            disabled={isPending || !text.trim() || !clientPhone}
            className="w-11 h-11 rounded-[8px] bg-accent-main flex items-center justify-center text-black hover:opacity-90 transition-all disabled:opacity-20 shrink-0"
          >
            <PaperPlaneRight size={18} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  )
}
