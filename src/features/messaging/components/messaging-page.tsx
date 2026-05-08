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
  Sparkle,
  CircleNotch
} from '@phosphor-icons/react'
import { PageTitle } from '@/components/shared/page-title'
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
    <div className="space-y-16 animate-premium-in">
      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        <PageTitle 
          title="Mensagens" 
          subtitle="Gestão de relacionamento de alto nível. Comunique-se com seus clientes via WhatsApp com templates inteligentes e disparos em massa." 
          className="mb-0" 
        />

        <div className="flex items-center gap-4 ml-7 lg:ml-0">
          <button
            onClick={() => setIsTemplateOpen(true)}
            className="px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest bg-white/5 text-muted-foreground border border-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <FileText size={18} weight="bold" />
              <span>Templates</span>
            </div>
          </button>
          {isAdmin && (
            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="flex items-center gap-4 px-10 py-8 bg-white text-black rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-accent-cyan transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-accent-cyan/20 active:scale-95 group"
            >
              <Lightning size={22} weight="bold" className="group-hover:rotate-12 transition-transform" />
              Disparo em Massa
            </button>
          )}
        </div>
      </div>

      {/* KPI Section - Precision Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 overflow-hidden">
        {[
          { label: 'Enviadas Hoje', value: stats.today, icon: ChatCircle, color: '#00e5ff', desc: 'Mensagens processadas hoje' },
          { label: 'Esta Semana', value: stats.week, icon: Calendar, color: '#8b5cf6', desc: 'Volume semanal acumulado' },
          { label: 'Este Mês', value: stats.month, icon: TrendUp, color: '#10b981', desc: 'Crescimento mensal' },
          { label: 'Taxa de Erro', value: stats.failed, icon: Warning, color: stats.failed > 0 ? '#ef4444' : '#a0a0a0', desc: 'Falhas de entrega' }
        ].map((kpi, idx) => (
          <div key={idx} className="p-10 bg-black flex flex-col justify-between h-48 group">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
                {kpi.label}
              </p>
              <kpi.icon size={20} weight="bold" style={{ color: kpi.color }} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-5xl font-bold font-mono text-white tracking-tighter group-hover:text-accent-cyan transition-colors">
                {kpi.value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest opacity-30 group-hover:opacity-60 transition-opacity">
                {kpi.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Interface Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[400px,1fr] gap-0 border border-white/5 bg-black overflow-hidden"
        style={{ height: 'calc(100vh - 450px)', minHeight: '600px' }}
      >
        {/* Left Panel: Conversations */}
        <div className="border-r border-white/5 flex flex-col bg-black">
          <div className="px-8 py-6 border-b border-white/5">
            <h3 className="label-muted opacity-40">Conversas Ativas</h3>
          </div>
          <ConversationPanel
            conversations={conversations}
            allClients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={handleSelectClient}
          />
        </div>

        {/* Right Panel: Active Chat */}
        <div className="flex flex-col bg-black relative">
          {/* Subtle ambient glow */}
          <div className="glass-glow bg-accent-cyan top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-10" />
          
          {selectedClientId ? (
            loadingMessages ? (
              <div className="flex-1 flex items-center justify-center relative z-10">
                <CircleNotch size={32} className="animate-spin text-accent-cyan" />
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
            <div className="flex-1 flex flex-col items-start justify-center p-16 relative z-10">
              <div className="space-y-6">
                <h3 className="text-4xl font-syne font-bold text-white tracking-tighter uppercase leading-none">
                  Central de<br/>Atendimento<span className="text-accent-cyan">.</span>
                </h3>
                <p className="text-sm text-text-muted max-w-sm uppercase tracking-widest leading-relaxed opacity-60">
                  Selecione uma conversa para iniciar o atendimento.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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
