'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import {
  Ticket,
  Clock,
  Scissors,
  User,
  WhatsappLogo,
  CheckCircle,
  X,
  Queue,
} from '@phosphor-icons/react'
import { PageTitle } from '@/components/shared/page-title'
import { QueueTimer } from './queue-timer'
import { WaitingListRealtime } from './waiting-list-realtime'
import { confirmQueueSpot, leaveQueue, expireAndSkip } from '../actions'
import type { WaitingListEntry, ServiceOption, BarberOption } from '../types'

interface WaitingListPageClientProps {
  entry: WaitingListEntry | null
  clientId: string | null
  services: ServiceOption[]
  barbers: BarberOption[]
  organizationId: string
}

export function WaitingListPageClient({
  entry,
  organizationId,
}: WaitingListPageClientProps) {
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    if (!entry) return
    startTransition(async () => {
      const result = await confirmQueueSpot(entry.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Vaga confirmada! Seu agendamento foi criado.')
      }
    })
  }

  function handleLeave() {
    if (!entry) return
    startTransition(async () => {
      const result = await leaveQueue(entry.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Você saiu da fila de espera')
      }
    })
  }

  function handleExpire() {
    if (!entry) return
    startTransition(async () => {
      await expireAndSkip(entry.id)
      toast.info('Tempo expirado')
    })
  }

  function formatTime(dateStr: string | null): string {
    if (!dateStr) return '--:--'
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <WaitingListRealtime organizationId={organizationId} />

      <PageTitle
        title="Fila de Espera"
        subtitle="Acompanhe sua posição na fila"
      />

      {/* CASO: Cliente na fila - status "notified" */}
      {entry?.status === 'notified' && (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Alert header */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-red-500/10">
              <Ticket size={32} weight="duotone" className="text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary font-syne">
                🔔 VAGA DISPONÍVEL!
              </h2>
              <p className="text-sm text-text-secondary">
                Confirme antes que o tempo acabe
              </p>
            </div>
          </div>

          {/* Timer */}
          {entry.expires_at && (
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-sm text-text-secondary mb-3">
                ⏱️ Você tem 15 minutos para confirmar
              </p>
              <QueueTimer expiresAt={entry.expires_at} onExpire={handleExpire} size="lg" />
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 space-y-1">
              <p className="text-xs text-text-secondary flex items-center gap-1.5">
                <Scissors size={12} weight="duotone" /> Serviço
              </p>
              <p className="text-sm font-medium text-text-primary">
                {entry.service?.name || 'Não definido'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 space-y-1">
              <p className="text-xs text-text-secondary flex items-center gap-1.5">
                <User size={12} weight="duotone" /> Barbeiro
              </p>
              <p className="text-sm font-medium text-text-primary">
                {entry.barber?.full_name || 'Qualquer'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 space-y-1">
              <p className="text-xs text-text-secondary flex items-center gap-1.5">
                <Clock size={12} weight="duotone" /> Notificado às
              </p>
              <p className="text-sm font-medium text-text-primary">
                {formatTime(entry.called_at)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConfirm}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-500 text-text-primary font-bold text-base hover:bg-emerald-600 disabled:opacity-40 transition-all shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle size={22} weight="bold" />
              CONFIRMAR VAGA
            </button>
            <button
              onClick={handleLeave}
              disabled={isPending}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-text-secondary hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all font-medium"
            >
              <X size={18} weight="bold" />
              RECUSAR
            </button>
          </div>
        </div>
      )}

      {/* CASO: Cliente na fila - status "waiting" */}
      {entry?.status === 'waiting' && (
        <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/5 p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-yellow-500/10">
              <Ticket size={32} weight="duotone" className="text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary font-syne">
                🎫 VOCÊ ESTÁ NA FILA!
              </h2>
              <p className="text-sm text-text-secondary">
                Aguardando uma vaga abrir
              </p>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
              <p className="text-xs text-text-secondary">Posição</p>
              <p className="text-4xl font-bold text-accent-cyan font-syne">
                #{entry.position}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
              <p className="text-xs text-text-secondary">Tempo estimado</p>
              <p className="text-4xl font-bold text-text-primary font-syne">
                ~{entry.estimated_wait_minutes || '--'}
              </p>
              <p className="text-xs text-text-secondary">minutos</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 p-4 rounded-xl bg-white/5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary flex items-center gap-1.5">
                <Scissors size={14} weight="duotone" /> Serviço
              </span>
              <span className="text-sm font-medium text-text-primary">
                {entry.service?.name || 'Não definido'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary flex items-center gap-1.5">
                <User size={14} weight="duotone" /> Barbeiro
              </span>
              <span className="text-sm font-medium text-text-primary">
                {entry.barber?.full_name || 'Qualquer'} {entry.barber && <span className="text-text-primary/30">(preferido)</span>}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary flex items-center gap-1.5">
                <Clock size={14} weight="duotone" /> Entrando às
              </span>
              <span className="text-sm font-medium text-text-primary">
                {formatTime(entry.arrived_at)}
              </span>
            </div>
          </div>

          {/* WhatsApp notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <WhatsappLogo size={24} weight="duotone" className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-text-primary font-medium">Fique atento ao WhatsApp!</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Você será notificado quando uma vaga abrir. Mantenha o app aberto para confirmar rapidamente.
              </p>
            </div>
          </div>

          {/* Leave button */}
          <button
            onClick={handleLeave}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all font-medium"
          >
            <X size={16} weight="bold" />
            SAIR DA FILA
          </button>
        </div>
      )}

      {/* CASO: Cliente confirmou */}
      {entry?.status === 'confirmed' && (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-3">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/10">
              <CheckCircle size={48} weight="duotone" className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary font-syne">
              ✅ Vaga Confirmada!
            </h2>
            <p className="text-text-secondary">
              Seu agendamento foi criado. Compareça no horário marcado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 space-y-1 text-center">
              <p className="text-xs text-text-secondary">Serviço</p>
              <p className="text-sm font-medium text-text-primary">
                {entry.service?.name || 'Não definido'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 space-y-1 text-center">
              <p className="text-xs text-text-secondary">Barbeiro</p>
              <p className="text-sm font-medium text-text-primary">
                {entry.barber?.full_name || 'A definir'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CASO: Cliente NÃO está na fila */}
      {!entry && (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex p-6 rounded-full bg-white/5">
            <Queue size={48} weight="duotone" className="text-text-secondary" />
          </div>
          <div className="space-y-2 max-w-sm mx-auto">
            <h3 className="text-xl font-bold text-text-primary font-syne">
              📋 Sem horário hoje?
            </h3>
            <p className="text-sm text-text-secondary">
              Entre na fila de espera e avisamos quando abrir uma vaga!
            </p>
          </div>
          <p className="text-xs text-text-secondary/60">
            Peça ao barbeiro ou atendente para adicioná-lo à fila.
          </p>
        </div>
      )}
    </>
  )
}
