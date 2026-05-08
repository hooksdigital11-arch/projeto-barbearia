'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KPICard } from '@/components/shared/kpi-card'
import { ConversationPanel, ChatPanel } from './chat-interface'
import { BroadcastModal } from './broadcast-modal'
import { TemplateModal } from './template-modal'
import type { Message, MessageConversation, MessagingStats, ClientForMessage, MessageTemplate } from '../types'
import { 
  ChatCircle, 
  Lightning, 
  FileText, 
  TrendUp, 
  Users, 
  Warning, 
  Calendar,
  Sparkle
} from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils/cn'

interface MessagingPageProps {
  conversations: MessageConversation[]
  stats: MessagingStats
  clients: ClientForMessage[]
  templates: MessageTemplate[]
  orgName: string
  isAdmin: boolean
  initialMessages?: Message[]
}

export function MessagingPage({
  conversations,
  stats,
  clients,
  templates,
  orgName,
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

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <div className="space-y-16 animate-in fade-in duration-1000 h-full">
      {/* Header com Design Premium Assimétrico */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-14 bg-accent-cyan rounded-full shadow-[0_0_40px_rgba(0,229,255,0.3)]" />
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black font-syne text-white tracking-tighter leading-none uppercase">
              Mensagens<span className="text-accent-cyan">.</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg font-medium max-w-md ml-6 border-l border-white/5 pl-8 leading-relaxed">
            Gestão de relacionamento de alto nível. Templates inteligentes e disparos automatizados para máxima conversão.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 lg:ml-0">
          <button
            onClick={() => setIsTemplateOpen(true)}
            className="flex items-center gap-3 px-8 py-5 rounded-full border border-white/10 bg-white/5 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all duration-300"
          >
            <FileText size={20} weight="bold" />
            Templates
          </button>
          {isAdmin && (
            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black text-xs font-black uppercase tracking-[0.2em] hover:bg-accent-cyan transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-accent-cyan/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <Lightning size={20} weight="bold" className="relative z-10" />
              <span className="relative z-10">Disparo em Massa</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Estilo Nubank/Apple */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Enviadas Hoje', value: stats.today, icon: Sparkle, color: '#00e5ff' },
          { title: 'Esta Semana', value: stats.week, icon: Calendar, color: '#ffffff' },
          { title: 'Este Mês', value: stats.month, icon: TrendUp, color: '#10b981' },
          { title: 'Taxa de Erro', value: stats.failed, icon: Warning, color: '#ef4444' }
        ].map((kpi, idx) => (
          <div key={idx} className="p-10 rounded-[32px] bg-[#0d0d0d] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-700 group">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/[0.03] border border-white/5">
                <kpi.icon size={22} weight="duotone" style={{ color: kpi.color }} />
              </div>
              <div>
                <h4 className="text-[10px] font-dm-mono font-bold text-muted-foreground uppercase tracking-[0.3em] mb-2">{kpi.title}</h4>
                <p className="text-5xl font-bold text-white font-syne tracking-tighter tabular-nums">
                  {kpi.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Interface Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[360px,1fr] gap-0 rounded-[24px] border border-white/5 bg-[#0a0a0a] overflow-hidden shadow-2xl"
        style={{ height: 'calc(100vh - 420px)', minHeight: '520px' }}
      >
        {/* Left Panel: Conversations */}
        <div className="border-r border-white/5 flex flex-col bg-[#0d0d0d]">
          <div className="px-8 py-6 border-b border-white/5">
            <h3 className="text-[10px] font-dm-mono font-bold text-muted-foreground uppercase tracking-widest">Conversas Ativas</h3>
          </div>
          <ConversationPanel
            conversations={conversations}
            allClients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={handleSelectClient}
          />
        </div>

        {/* Right Panel: Active Chat */}
        <div className="flex flex-col bg-[#050505]">
          {selectedClientId ? (
            loadingMessages ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
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
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8">
                <ChatCircle size={40} weight="thin" className="text-muted-foreground/20" />
              </div>
              <h3 className="text-xl font-syne font-bold text-white tracking-tight mb-2 uppercase">Central de Atendimento</h3>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed opacity-50">
                Selecione uma conversa à esquerda para visualizar o histórico ou iniciar um novo atendimento premium via WhatsApp.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals with Injected Templates */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        orgName={orgName}
        templates={templates}
      />
      <TemplateModal
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        clients={clients}
        templates={templates}
        orgName={orgName}
        onRefresh={handleRefresh}
      />
    </div>
  )
}
