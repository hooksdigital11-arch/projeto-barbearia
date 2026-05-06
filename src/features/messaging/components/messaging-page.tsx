'use client'

import { useState } from 'react'
import { KPICard } from '@/components/shared/kpi-card'
import { ConversationPanel, ChatPanel } from './chat-interface'
import { BroadcastModal } from './broadcast-modal'
import { TemplateModal } from './template-modal'
import type { Message, MessageConversation, MessagingStats, ClientForMessage } from '../types'
import { 
  ChatCircle, 
  Lightning, 
  FileText, 
  TrendUp, 
  Users, 
  Warning, 
  Calendar 
} from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils/cn'

interface MessagingPageProps {
  conversations: MessageConversation[]
  stats: MessagingStats
  clients: ClientForMessage[]
  orgName: string
  isAdmin: boolean
  initialMessages?: Message[]
}

export function MessagingPage({
  conversations,
  stats,
  clients,
  orgName,
  isAdmin,
}: MessagingPageProps) {
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

    // Fetch messages client-side via a fresh server request
    try {
      const res = await fetch(`/api/messaging/messages?clientId=${clientId}`)
      if (res.ok) {
        const data = await res.json()
        setCurrentMessages(Array.isArray(data) ? data : [])
      }
    } catch {
      // Silently fail — messages will be empty
      setCurrentMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-accent-cyan uppercase tracking-[0.2em] mb-2">COMUNICAÇÃO</p>
          <h1 className="text-3xl md:text-4xl font-bold font-syne text-white uppercase tracking-tight leading-none">
            Mensageria
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            WhatsApp direto com seus clientes.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => setIsTemplateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-bold hover:bg-white/10 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Templates
          </button>
          {isAdmin && (
            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-cyan text-black text-sm font-bold hover:bg-accent-cyan/90 transition-colors"
            >
              <Lightning size={18} weight="bold" />
              Disparo em Massa
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Enviadas Hoje"
          value={stats.today.toString()}
          icon={<ChatCircle size={20} weight="duotone" />}
          subtitle="via WhatsApp"
        />
        <KPICard
          title="Esta Semana"
          value={stats.week.toString()}
          icon={<Calendar size={20} weight="duotone" />}
          subtitle="últimos 7 dias"
        />
        <KPICard
          title="Este Mês"
          value={stats.month.toString()}
          icon={<TrendUp size={20} weight="duotone" />}
          subtitle="últimos 30 dias"
        />
        <KPICard
          title="Falhas"
          value={stats.failed.toString()}
          icon={<Warning size={20} weight="duotone" />}
          subtitle="não enviadas"
        />
      </div>

      {/* Chat Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[320px,1fr] gap-0 rounded-2xl border border-white/5 bg-[#141414] overflow-hidden"
        style={{ height: 'calc(100vh - 380px)', minHeight: '480px' }}
      >
        {/* Left: Conversations */}
        <div className="border-r border-white/5 flex flex-col">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Conversas</p>
          </div>
          <ConversationPanel
            conversations={conversations}
            allClients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={handleSelectClient}
          />
        </div>

        {/* Right: Chat */}
        <div className="flex flex-col">
          {selectedClientId ? (
            loadingMessages ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ChatPanel
                messages={currentMessages}
                clientId={selectedClientId}
                clientName={selectedClientName}
                clientPhone={selectedClientPhone}
                orgName={orgName}
              />
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <p className="font-medium text-white">Selecione um cliente</p>
              <p className="text-sm mt-1 text-center max-w-xs">
                Escolha uma conversa à esquerda ou busque um cliente pelo nome.
              </p>
            </div>
          )}
        </div>
      </div>

      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        orgName={orgName}
      />
      <TemplateModal
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        clients={clients}
        orgName={orgName}
      />
    </div>
  )
}
