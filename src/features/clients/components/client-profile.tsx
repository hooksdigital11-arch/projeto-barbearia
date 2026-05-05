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
  User,
  Scissors,
  CurrencyDollar,
  Star,
  Trash,
  Prohibit,
  WhatsappLogo,
  ArrowCounterClockwise,
} from '@phosphor-icons/react'
import Link from 'next/link'
import { KPICard } from '@/components/shared/kpi-card'
import { ClientAvatar } from './client-avatar'
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

const statusBadge = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  blocked: 'bg-red-500/10 text-red-400 border-red-500/20',
  inactive: 'bg-white/10 text-text-secondary border-white/10',
}
const statusLabel = {
  active: '🟢 Ativo',
  blocked: '🔴 Bloqueado',
  inactive: '⚫ Inativo',
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
  const [isPending, startTransition] = useTransition()

  const isAdmin = role === 'admin'
  const showFinancials = isAdmin

  function handleDelete() {
    if (!confirm(`Remover ${client.full_name}?\n\nEste cliente tem ${client.total_visits || 0} visitas e ${formatCurrency(client.totalSpentCalc)} gastos.\n\nO cliente será desativado (soft delete).`)) return

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
    { key: 'history', label: 'Histórico', count: client.pastAppointments.length },
    { key: 'upcoming', label: 'Próximos', count: client.upcomingAppointments.length },
    { key: 'loyalty', label: 'Fidelidade' },
    { key: 'notes', label: 'Notas' },
  ]

  return (
    <>
      {/* Back button */}
      <Link
        href={basePath}
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} weight="bold" />
        Voltar
      </Link>

      {/* Header Card */}
      <div className="rounded-2xl border border-white/5 bg-card/20 backdrop-blur-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <ClientAvatar name={client.full_name} size="xl" />

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-white font-syne">{client.full_name}</h1>
                <span className={cn('inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-md border mt-1', statusBadge[client.status])}>
                  {statusLabel[client.status]}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 text-text-secondary hover:text-white hover:bg-white/10 transition-colors text-sm font-medium border border-white/10"
                >
                  <PencilSimple size={14} weight="bold" />
                  Editar
                </button>

                {/* More menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-xl bg-white/5 text-text-secondary hover:text-white hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <DotsThreeVertical size={18} weight="bold" />
                  </button>

                  {showMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-bg-secondary shadow-2xl shadow-black/50 z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button
                          onClick={() => { openWhatsApp(); setShowMenu(false) }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <WhatsappLogo size={16} weight="duotone" />
                          Enviar WhatsApp
                        </button>
                        {isAdmin && client.status === 'active' && (
                          <button
                            onClick={() => { handleBlock(); setShowMenu(false) }}
                            disabled={isPending}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-text-secondary hover:text-yellow-400 hover:bg-yellow-500/5 transition-colors"
                          >
                            <Prohibit size={16} weight="duotone" />
                            Bloquear cliente
                          </button>
                        )}
                        {isAdmin && client.status === 'blocked' && (
                          <button
                            onClick={() => { handleReactivate(); setShowMenu(false) }}
                            disabled={isPending}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-text-secondary hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors"
                          >
                            <ArrowCounterClockwise size={16} weight="duotone" />
                            Reativar cliente
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <div className="border-t border-white/5 my-1" />
                            <button
                              onClick={() => { handleDelete(); setShowMenu(false) }}
                              disabled={isPending}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 transition-colors"
                            >
                              <Trash size={16} weight="duotone" />
                              Remover cliente
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Info items */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {client.phone && (
                <span className="text-sm text-text-secondary flex items-center gap-1.5">
                  <Phone size={14} weight="duotone" />
                  {client.phone}
                </span>
              )}
              {client.email && (
                <span className="text-sm text-text-secondary flex items-center gap-1.5">
                  <Envelope size={14} weight="duotone" />
                  {client.email}
                </span>
              )}
              {client.birthday && (
                <span className="text-sm text-text-secondary flex items-center gap-1.5">
                  <Cake size={14} weight="duotone" />
                  {formatDate(client.birthday)} ({calculateAge(client.birthday)} anos)
                </span>
              )}
              {client.preferred_barber && (
                <span className="text-sm text-text-secondary flex items-center gap-1.5">
                  <User size={14} weight="duotone" />
                  Barbeiro pref: {client.preferred_barber.full_name}
                </span>
              )}
              <span className="text-sm text-text-secondary flex items-center gap-1.5">
                <Calendar size={14} weight="duotone" />
                Cliente desde: {formatDate(client.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="Visitas"
          value={client.total_visits || client.pastAppointments.length}
          icon={<Scissors size={20} weight="duotone" />}
        />
        {showFinancials ? (
          <KPICard
            title="Total Gasto"
            value={formatCurrency(client.totalSpentCalc)}
            icon={<CurrencyDollar size={20} weight="duotone" />}
          />
        ) : (
          <KPICard
            title="Última Visita"
            value={formatDate(client.last_visit_at)}
            icon={<Calendar size={20} weight="duotone" />}
          />
        )}
        {showFinancials ? (
          <KPICard
            title="Ticket Médio"
            value={formatCurrency(client.avgTicket)}
            icon={<CurrencyDollar size={20} weight="duotone" />}
          />
        ) : (
          <KPICard
            title="Próximos"
            value={client.upcomingAppointments.length}
            icon={<Calendar size={20} weight="duotone" />}
          />
        )}
        <KPICard
          title="Fidelidade"
          value={`${client.stampBalance}/${loyaltyGoal}`}
          icon={<Star size={20} weight="duotone" />}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/5 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap',
              activeTab === tab.key
                ? 'text-accent-cyan border-accent-cyan'
                : 'text-text-secondary border-transparent hover:text-white hover:border-white/20'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-md',
                activeTab === tab.key
                  ? 'bg-accent-cyan/10 text-accent-cyan'
                  : 'bg-white/5 text-text-secondary'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[200px]">
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
    </>
  )
}
