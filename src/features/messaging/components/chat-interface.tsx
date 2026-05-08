'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { recordMessage } from '../actions'
import type { Message, MessageConversation, ClientForMessage } from '../types'
import { 
  PaperPlaneRight, 
  MagnifyingGlass, 
  Phone, 
  ChatCircle, 
  CaretRight 
} from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'

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
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-white/5">
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 h-9 text-sm"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered ? (
          // Search results from allClients
          filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Nenhum cliente encontrado</p>
          ) : (
            filtered.map(c => (
              <button
                key={c.id}
                onClick={() => onSelectClient(c.id, c.full_name, c.phone)}
                className={cn(
                  'w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/3',
                  selectedClientId === c.id && 'bg-accent-cyan/5 border-l-2 border-l-accent-cyan'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-accent-cyan/10 flex items-center justify-center text-accent-cyan font-bold text-sm uppercase shrink-0">
                  {c.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.full_name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone || 'Sem telefone'}</p>
                </div>
              </button>
            ))
          )
        ) : (
          // Recent conversations
          conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground px-4">
              <ChatCircle size={32} weight="duotone" className="opacity-20 mb-3" />
              <p className="text-sm text-center">Nenhuma conversa ainda.</p>
              <p className="text-xs text-center mt-1">Busque um cliente para começar.</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.client_id}
                onClick={() => onSelectClient(conv.client_id, conv.client_name, conv.client_phone)}
                className={cn(
                  'w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/3',
                  selectedClientId === conv.client_id && 'bg-accent-cyan/5 border-l-2 border-l-accent-cyan'
                )}
              >
                <div className="w-9 h-9 rounded-full bg-accent-cyan/10 flex items-center justify-center text-accent-cyan font-bold text-sm uppercase shrink-0">
                  {conv.client_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-white truncate">{conv.client_name}</p>
                    <p className="text-[10px] text-muted-foreground shrink-0 ml-2" suppressHydrationWarning>
                      {new Date(conv.last_message_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
                </div>
              </button>
            ))
          )
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
  orgName: string
}

export function ChatPanel({ messages, clientId, clientName, clientPhone, orgName }: ChatPanelProps) {
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendWhatsApp(phone: string, message: string) {
    const clean = phone.replace(/\D/g, '')
    const url = `https://wa.me/55${clean}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const handleSend = () => {
    if (!text.trim()) return
    if (!clientPhone) {
      toast.error('Este cliente não tem telefone cadastrado.')
      return
    }

    const content = text.trim()
    startTransition(async () => {
      // Open WhatsApp first
      sendWhatsApp(clientPhone, content)

      // Then record
      const fd = new FormData()
      fd.append('client_id', clientId)
      fd.append('content', content)
      const res = await recordMessage(fd)
      if (res.error) toast.error(res.error)
      else {
        setText('')
        toast.success('Mensagem registrada!')
      }
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-accent-cyan/10 flex items-center justify-center text-accent-cyan font-bold text-sm uppercase">
          {clientName.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-white text-sm">{clientName}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Phone size={12} weight="duotone" />
            {clientPhone || 'Sem telefone'}
          </p>
        </div>
        {clientPhone && (
          <a
            href={`https://wa.me/55${clientPhone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] text-xs font-bold hover:bg-[#25D366]/20 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Abrir WhatsApp
          </a>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ChatCircle size={32} weight="duotone" className="opacity-20 mb-3" />
            <p className="text-sm">Nenhuma mensagem ainda</p>
            <p className="text-xs mt-1">Comece uma conversa abaixo.</p>
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
                  'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm',
                  msg.direction === 'sent'
                    ? 'bg-accent-cyan text-black rounded-br-none'
                    : 'bg-white/10 text-white rounded-bl-none'
                )}
              >
                <p className="leading-relaxed">{msg.content}</p>
                <div className={cn(
                  'flex items-center gap-1 mt-1',
                  msg.direction === 'sent' ? 'justify-end' : 'justify-start'
                )}>
                  <span className={cn('text-[10px]', msg.direction === 'sent' ? 'text-black/60' : 'text-white/40')} suppressHydrationWarning>
                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.template_used && (
                    <span className="text-[9px] px-1 rounded bg-black/10 text-black/50">{msg.template_used}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5">
        {!clientPhone ? (
          <p className="text-center text-xs text-red-400/80 py-2">
            ⚠️ Cliente sem telefone — impossível enviar mensagem.
          </p>
        ) : (
          <div className="flex gap-3">
            <Input
              placeholder="Digite uma mensagem..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend() }}
              className="flex-1 bg-white/5 border-white/10"
              disabled={isPending}
            />
            <button
              onClick={handleSend}
              disabled={isPending || !text.trim()}
              className="w-10 h-10 rounded-xl bg-accent-cyan flex items-center justify-center text-black hover:bg-accent-cyan/90 transition-colors disabled:opacity-40 shrink-0"
            >
              <PaperPlaneRight size={18} weight="bold" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
