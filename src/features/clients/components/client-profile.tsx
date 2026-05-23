'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import {
  ArrowLeft,
  PencilSimple,
  DotsThreeVertical,
  Phone,
  Envelope,
  Cake,
  Calendar,
  Scissors,
  CurrencyDollar,
  Star,
  Trash,
  Prohibit,
  WhatsappLogo,
  ArrowCounterClockwise,
} from '@phosphor-icons/react'
import Link from 'next/link'
import { EditClientModal } from './edit-client-modal'
import { ClientHistoryTab } from './client-history-tab'
import { ClientUpcomingTab } from './client-upcoming-tab'
import { ClientLoyaltyTab } from './client-loyalty-tab'
import { ClientNotes } from './client-notes'
import { deleteClientAction, blockClientAction, reactivateClientAction } from '../actions'
import type { ClientProfile as ClientProfileType, BarberOption } from '../types'

interface ClientProfileProps {
  client: ClientProfileType
  barbers: BarberOption[]
  role: 'admin' | 'barber'
  basePath: string
  loyaltyGoal: number
}

type Tab = 'history' | 'upcoming' | 'loyalty' | 'notes'

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function calculateAge(birthday: string): number {
  const birth = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function ClientProfileComponent({
  client,
  barbers,
  role,
  basePath,
  loyaltyGoal,
}: ClientProfileProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('history')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [, startTransition] = useTransition()

  const isAdmin = role === 'admin'
  const showFinancials = isAdmin

  function handleDelete() {
    if (!confirm(`Remover ${client.full_name}?`)) return
    startTransition(async () => {
      const result = await deleteClientAction(client.id)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Cliente removido')
        router.push(basePath)
      }
    })
  }

  function handleBlock() {
    if (!confirm(`Bloquear ${client.full_name}? O cliente não poderá fazer novos agendamentos.`)) return
    startTransition(async () => {
      const result = await blockClientAction(client.id)
      if (result.error) toast.error(result.error)
      else toast.success('Cliente bloqueado')
    })
  }

  function handleReactivate() {
    startTransition(async () => {
      const result = await reactivateClientAction(client.id)
      if (result.error) toast.error(result.error)
      else toast.success('Cliente reativado!')
    })
  }

  function openWhatsApp() {
    if (!client.phone) { toast.error('Telefone não cadastrado'); return }
    const cleanPhone = client.phone.replace(/\D/g, '')
    window.open(`https://wa.me/55${cleanPhone}`, '_blank')
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'history', label: 'HISTÓRICO', count: client.pastAppointments.length },
    { key: 'upcoming', label: 'PRÓXIMOS', count: client.upcomingAppointments.length },
    { key: 'loyalty', label: 'FIDELIDADE' },
    { key: 'notes', label: 'NOTAS' },
  ]

  return (
    <div className="animate-premium-in py-8">
      {/* Back button */}
      <Link
        href={basePath}
        className="inline-flex items-center gap-[7px] text-[11px] text-[#333] tracking-[0.06em] hover:text-[#666] transition-all mb-8 uppercase font-medium"
      >
        <ArrowLeft size={14} weight="regular" />
        Voltar
      </Link>

      {/* Profile Card */}
      <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[10px] p-[20px] px-[22px] flex items-center gap-[18px] mb-8">
        <div className="w-[56px] h-[56px] rounded-full bg-[#6b21a8] flex items-center justify-center shrink-0">
          <span className="text-[18px] font-medium text-text-primary uppercase">
            {client.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-[18px] font-medium text-text-primary uppercase tracking-tight truncate max-w-[300px]">
                {client.full_name}
              </h1>
              {client.status === 'active' && (
                <div className="bg-[#0d2e1a] border-[0.5px] border-accent-main/20 rounded-[5px] px-[10px] py-[3px] flex items-center gap-1.5">
                  <div className="w-[5px] h-[5px] rounded-full bg-accent-main" />
                  <span className="text-[9px] font-medium text-accent-main tracking-[0.08em] uppercase">ATIVO</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-2 bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[14px] py-[8px] text-[10px] font-medium text-text-muted tracking-[0.08em] uppercase transition-all hover:border-[#333] hover:text-text-secondary"
              >
                <PencilSimple size={12} weight="regular" />
                EDITAR
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-[32px] h-[32px] flex items-center justify-center bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] text-text-nav transition-all hover:text-text-primary hover:border-[#444]"
                >
                  <DotsThreeVertical size={16} weight="regular" />
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-[38px] min-w-[170px] bg-bg-surface border-[0.5px] border-[#222] rounded-[8px] p-1 shadow-none z-50 animate-in fade-in zoom-in-95 duration-200">
                      <button
                        onClick={() => { openWhatsApp(); setShowMenu(false) }}
                        className="flex items-center justify-start gap-[9px] w-full px-[12px] py-[9px] text-[11px] text-text-muted tracking-[0.04em] rounded-[6px] transition-all hover:bg-[#1a1a1a] hover:text-text-secondary group/item uppercase font-medium text-left whitespace-nowrap"
                      >
                        <WhatsappLogo size={14} weight="regular" className="text-[#444] group-hover/item:text-text-muted transition-colors shrink-0" />
                        WhatsApp
                      </button>

                      {isAdmin && (
                        <>
                          <div className="h-[0.5px] bg-[#1e1e1e] my-[4px]" />
                          {client.status === 'active' ? (
                            <button
                              onClick={() => { handleBlock(); setShowMenu(false) }}
                              className="flex items-center justify-start gap-[9px] w-full px-[12px] py-[9px] text-[11px] text-[#c04040] tracking-[0.04em] rounded-[6px] transition-all hover:bg-[#1a0f0f] hover:text-[#e05050] group/item uppercase font-medium text-left whitespace-nowrap"
                            >
                              <Prohibit size={14} weight="regular" className="text-[#7a2020] group-hover/item:text-[#c04040] transition-colors shrink-0" />
                              Bloquear cliente
                            </button>
                          ) : client.status === 'blocked' ? (
                            <button
                              onClick={() => { handleReactivate(); setShowMenu(false) }}
                              className="flex items-center justify-start gap-[9px] w-full px-[12px] py-[9px] text-[11px] text-accent-main tracking-[0.04em] rounded-[6px] transition-all hover:bg-accent-main/10 group/item uppercase font-medium text-left whitespace-nowrap"
                            >
                              <ArrowCounterClockwise size={14} weight="regular" className="text-accent-main/40 group-hover/item:text-accent-main transition-colors shrink-0" />
                              Reativar cliente
                            </button>
                          ) : null}

                          <div className="h-[0.5px] bg-[#1e1e1e] my-[4px]" />
                          <button
                            onClick={() => { handleDelete(); setShowMenu(false) }}
                            className="flex items-center justify-start gap-[9px] w-full px-[12px] py-[9px] text-[11px] text-red-500/80 tracking-[0.04em] rounded-[6px] transition-all hover:bg-red-500/10 hover:text-red-500 group/item uppercase font-medium text-left whitespace-nowrap"
                          >
                            <Trash size={14} weight="regular" className="text-red-500/40 group-hover/item:text-red-500/80 transition-colors shrink-0" />
                            Excluir Registro
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-[20px]">
            {client.phone && (
              <div className="flex items-center gap-1.5">
                <Phone size={12} weight="regular" className="text-[#2a2a2a]" />
                <span className="text-[10px] text-[#383838] font-medium uppercase">{client.phone}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-1.5">
                <Envelope size={12} weight="regular" className="text-[#2a2a2a]" />
                <span className="text-[10px] text-[#383838] font-medium uppercase truncate max-w-[150px]">{client.email}</span>
              </div>
            )}
            {client.birthday && (
              <div className="flex items-center gap-1.5">
                <Cake size={12} weight="regular" className="text-[#2a2a2a]" />
                <span className="text-[10px] text-[#383838] font-medium uppercase">
                  {formatDate(client.birthday)} ({calculateAge(client.birthday)} ANOS)
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={12} weight="regular" className="text-[#2a2a2a]" />
              <span className="text-[10px] text-[#383838] font-medium uppercase">
                DESDE: {formatDate(client.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px] mb-8">
        {[
          { label: 'VISITAS', value: client.total_visits || client.pastAppointments.length, icon: Scissors },
          { 
            label: showFinancials ? 'TOTAL GASTO' : 'ÚLTIMA VISITA', 
            value: showFinancials ? formatCurrency(client.totalSpentCalc) : formatDate(client.last_visit_at), 
            icon: showFinancials ? CurrencyDollar : Calendar,
            isMonetary: showFinancials
          },
          { 
            label: showFinancials ? 'TICKET MÉDIO' : 'PRÓXIMOS', 
            value: showFinancials ? formatCurrency(client.avgTicket) : client.upcomingAppointments.length, 
            icon: showFinancials ? CurrencyDollar : Calendar,
            isMonetary: showFinancials
          },
          { label: 'FIDELIDADE', value: `${client.stampBalance}/${loyaltyGoal}`, icon: Star },
        ].map((metric, idx) => (
          <div key={idx} className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px] px-[18px] flex flex-col items-start gap-[8px]">
            <metric.icon size={14} weight="regular" className="text-[#2a2a2a] mb-[10px]" />
            <p className="text-[9px] font-medium text-[#2e2e2e] tracking-[0.1em] uppercase">{metric.label}</p>
            <p className={cn(
              "font-medium text-text-primary tracking-tight leading-none",
              metric.isMonetary ? "text-[18px]" : "text-[22px]"
            )}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b-[0.5px] border-border-main overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-[10px] text-[11px] font-medium tracking-[0.06em] transition-all border-b-2 -mb-px whitespace-nowrap",
              activeTab === tab.key
                ? "text-text-primary border-accent-main"
                : "text-[#333] border-transparent hover:text-[#666]"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                "text-[9px] font-medium px-1.5 py-0.5 rounded-[4px] transition-all",
                activeTab === tab.key
                  ? "bg-[var(--accent-15, #00d4aa22)] text-accent-main"
                  : "bg-[#1e1e1e] text-text-nav"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {activeTab === 'history' && (
          <ClientHistoryTab
            appointments={client.pastAppointments}
            showFinancials={showFinancials}
          />
        )}
        {activeTab === 'upcoming' && (
          <ClientUpcomingTab appointments={client.upcomingAppointments} />
        )}
        {activeTab === 'loyalty' && (
          <ClientLoyaltyTab
            stamps={client.stamps}
            stampBalance={client.stampBalance}
            goal={loyaltyGoal}
          />
        )}
        {activeTab === 'notes' && (
          <ClientNotes
            clientId={client.id}
            notes={client.notes}
            updatedAt={client.updated_at}
          />
        )}
      </div>

      {/* Edit Modal */}
      <EditClientModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        client={client}
        barbers={barbers}
        isAdmin={isAdmin}
      />
    </div>
  )
}
