'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ConversationPanel, ChatPanel } from './chat-interface'
import { BroadcastModal } from './broadcast-modal'
import { TemplateModal } from './template-modal'
import { useRealtimeMessages } from '../hooks/use-realtime-messages'
import { markMessagesAsReadAction } from '../actions'
import { cn } from '@/lib/utils/cn'
import type { Message, MessageConversation, MessagingStats, ClientForMessage, MessageTemplate } from '../types'
import { 
  ChatCircle, 
  Lightning, 
  FileText, 
  TrendUp, 
  Warning, 
  Calendar,
  CircleNotch,
  ChatCircleText
} from '@phosphor-icons/react'

interface MessagingPageProps {
  conversations: MessageConversation[]
  stats: MessagingStats
  clients: ClientForMessage[]
  templates: MessageTemplate[]
  org: any
  isAdmin: boolean
  initialMessages?: Message[]
}

export function MessagingPage({
  conversations,
  stats,
  clients,
  templates,
  org,
  isAdmin,
}: MessagingPageProps) {
  const router = useRouter()
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedClientName, setSelectedClientName] = useState('')
  const [selectedClientPhone, setSelectedClientPhone] = useState<string | null>(null)
  const [currentMessages, setCurrentMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false)
  const [isTemplateOpen, setIsTemplateOpen] = useState(false)

  const handleSelectClient = async (clientId: string, name: string, phone: string | null) => {
    setSelectedClientId(clientId)
    setSelectedClientName(name)
    setSelectedClientPhone(phone)
    setLoadingMessages(true)

    // Marca as mensagens do cliente como lidas no banco
    markMessagesAsReadAction(clientId)

    try {
      const res = await fetch(`/api/messaging/messages?clientId=${clientId}`)
      if (res.ok) {
        const data = await res.json()
        setCurrentMessages(Array.isArray(data) ? data : [])
      }
    } catch {
      setCurrentMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  // ── Realtime: escuta novas mensagens do cliente selecionado ────────────────
  useRealtimeMessages(
    selectedClientId,
    useCallback((newMsg) => {
      setCurrentMessages(prev => {
        // Evita duplicatas (mensagem enviada localmente já está na lista)
        if (prev.some(m => m.id === newMsg.id)) return prev

        // Se a mensagem foi recebida, marca como lida imediatamente
        if (newMsg.direction === 'received' && selectedClientId) {
          markMessagesAsReadAction(selectedClientId)
        }

        return [...prev, newMsg]
      })
    }, [selectedClientId])
  )

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-[32px] font-medium tracking-[-0.02em] text-text-primary">
            MENSAGENS<span className="text-accent-main">.</span>
          </h1>
          <p className="text-[11px] text-[#333] leading-[1.5] max-w-[440px] uppercase tracking-wide">
            Gestão de relacionamento de alto nível. Comunique-se com seus clientes via WhatsApp com templates inteligentes e disparos em massa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTemplateOpen(true)}
            className="flex items-center justify-center gap-2 bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[16px] min-h-[44px] text-[10px] font-medium text-[#666] uppercase tracking-[0.08em] transition-all hover:border-[#333] hover:text-[#aaa]"
          >
            <FileText size={14} weight="regular" />
            Templates
          </button>
          {isAdmin && (
            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="flex items-center justify-center gap-2 bg-accent-main text-black rounded-[8px] px-[16px] min-h-[44px] text-[10px] font-medium uppercase tracking-[0.08em] transition-all hover:opacity-90"
            >
              <Lightning size={14} weight="bold" />
              Disparo em Massa
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Enviadas Hoje', value: stats.today, icon: ChatCircle, color: 'var(--accent, #00d4aa)' },
          { label: 'Esta Semana', value: stats.week, icon: Calendar, color: 'var(--accent, #00d4aa)' },
          { label: 'Este Mês', value: stats.month, icon: TrendUp, color: 'var(--accent, #00d4aa)' },
          { label: 'Taxa de Erro', value: stats.failed, icon: Warning, color: stats.failed > 0 ? '#ef4444' : '#333' }
        ].map((kpi, i) => (
          <div key={i} className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[10px] p-[20px_22px] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.12em]">{kpi.label}</span>
              <kpi.icon size={16} weight="duotone" className="text-[#333]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[24px] font-medium text-text-primary tracking-tight">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chat Area */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] bg-bg-sidebar border-[0.5px] border-border-main rounded-[10px] overflow-hidden min-h-[320px] h-[calc(100vh-400px)]">
        {/* Left Column: Conversations */}
        <div className={cn(
          "border-r-[0.5px] border-border-main bg-bg-sidebar flex-col h-full min-h-0",
          selectedClientId ? "hidden md:flex" : "flex"
        )}>
          <ConversationPanel
            conversations={conversations}
            allClients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={handleSelectClient}
          />
        </div>

        {/* Right Column: Central de Atendimento */}
        <div className={cn(
          "bg-bg-sidebar flex-col h-full min-h-0",
          selectedClientId ? "flex" : "hidden md:flex"
        )}>
          {selectedClientId ? (
            loadingMessages ? (
              <div className="flex-1 flex items-center justify-center">
                <CircleNotch size={24} className="animate-spin text-[#333]" />
              </div>
            ) : (
              <ChatPanel
                messages={currentMessages}
                clientId={selectedClientId}
                clientName={selectedClientName}
                clientPhone={selectedClientPhone}
                onBack={() => setSelectedClientId(null)}
                onMessageSent={() => handleSelectClient(selectedClientId, selectedClientName, selectedClientPhone)}
              />
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-[48px] h-[48px] bg-bg-surface border-[0.5px] border-border-main rounded-full flex items-center justify-center text-[#2a2a2a] mb-4">
                <ChatCircleText size={20} weight="regular" />
              </div>
              <h3 className="text-[24px] font-medium text-[#1e1e1e] tracking-[-0.02em] leading-tight uppercase">
                Central de<br/>Atendimento<span className="text-accent-main">.</span>
              </h3>
              <p className="text-[10px] text-[#222] uppercase tracking-[0.06em] mt-2">
                Selecione uma conversa para iniciar o atendimento
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        orgName={org?.name || 'Barbearia'}
        templates={templates}
      />
      <TemplateModal
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        clients={clients}
        templates={templates}
        org={org}
        onRefresh={handleRefresh}
      />
    </div>
  )
}
