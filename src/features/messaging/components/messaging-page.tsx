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
    <div className="space-y-16 animate-in fade-in duration-1000 h-full">
      {/* Header com Design Assimétrico */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-12 bg-accent-cyan rounded-full shadow-[0_0_30px_rgba(0,229,255,0.4)]" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-syne text-white tracking-tighter leading-none uppercase break-words">
              Mensagens<span className="text-accent-cyan">.</span>
            </h1>
          </div>
          <p className="text-text-secondary text-lg font-medium max-w-md ml-7 border-l border-white/10 pl-6">
            Comunicação direta e automatizada. Conecte-se com seus clientes via WhatsApp com templates inteligentes e disparos em massa estratégicos.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 lg:ml-0">
          <button
            onClick={() => setIsTemplateOpen(true)}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all duration-300"
          >
            <FileText size={20} weight="bold" />
            Templates
          </button>
          {isAdmin && (
            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="flex items-center gap-3 px-8 py-4 rounded-3xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-accent-cyan transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-accent-cyan/20 active:scale-95 group"
            >
              <Lightning size={20} weight="bold" className="group-hover:animate-pulse" />
              Disparo em Massa
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards com Design Pro Max */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { title: 'Enviadas Hoje', value: stats.today, icon: ChatCircle, color: '#8b5cf6', desc: 'Mensagens processadas' },
          { title: 'Esta Semana', value: stats.week, icon: Calendar, color: '#3b82f6', desc: 'Volume últimos 7 dias' },
          { title: 'Este Mês', value: stats.month, icon: TrendUp, color: '#10b981', desc: 'Engajamento mensal' },
          { title: 'Falhas', value: stats.failed, icon: Warning, color: '#ef4444', desc: 'Erros de processamento' }
        ].map((kpi, idx) => (
          <div key={idx} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-white/[0.03] border border-white/10 group-hover:scale-110 transition-transform">
                <kpi.icon size={24} weight="duotone" style={{ color: kpi.color }} />
              </div>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{kpi.title}</h4>
              <p className="text-4xl font-bold text-white tabular-nums tracking-tighter">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest opacity-50">{kpi.desc}</p>
            </div>
            <div className="absolute -bottom-2 -right-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <kpi.icon size={80} weight="duotone" />
            </div>
          </div>
        ))}
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
