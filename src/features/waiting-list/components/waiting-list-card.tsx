'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import {
  DeviceMobileCamera,
  X,
  CheckCircle,
  FastForward,
  Scissors,
  Clock,
  Phone,
  User,
} from '@phosphor-icons/react'
import { notifyClient, leaveQueue, expireAndSkip, confirmQueueSpot } from '../actions'
import { QueueTimer } from './queue-timer'
import type { WaitingListEntry, WhatsAppData } from '../types'

interface WaitingListCardProps {
  entry: WaitingListEntry
  role: 'admin' | 'barber' | 'client'
}

/** Cores dos barbeiros conhecidos */
const BARBER_COLORS: Record<string, string> = {
  rafael: '#3b82f6',
  thiago: '#f59e0b',
  marcos: '#10b981',
}

function getBarberColor(name: string | null | undefined): string {
  if (!name) return '#6b7280'
  const key = name.toLowerCase().split(' ')[0] ?? ''
  return BARBER_COLORS[key] || '#6b7280'
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '--:--'
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function openWhatsApp(data: WhatsAppData) {
  if (!data.phone) {
    toast.error('Telefone do cliente não disponível')
    return
  }
  const cleanPhone = data.phone.replace(/\D/g, '')
  const phoneWithCountry = `55${cleanPhone}`

  const message = `Olá ${data.clientName || 'Cliente'}! 🎉
Uma vaga abriu na Barbearia hoje!

✂️ Serviço: ${data.serviceName || 'Não especificado'}
💈 Barbeiro: ${data.barberName}

Você tem 15 minutos para confirmar sua vaga.
Acesse o app para confirmar!

Se não confirmar, a vaga irá para o próximo da fila.`

  const encodedMessage = encodeURIComponent(message)
  window.open(`https://wa.me/${phoneWithCountry}?text=${encodedMessage}`, '_blank')
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'waiting':
      return {
        label: 'Aguardando vaga',
        emoji: '🟡',
        borderClass: 'border-yellow-500/30',
        bgClass: 'bg-yellow-500/5',
        badgeClass: 'bg-yellow-500/10 text-yellow-400',
      }
    case 'notified':
      return {
        label: 'Notificado',
        emoji: '🔴',
        borderClass: 'border-red-500/30',
        bgClass: 'bg-red-500/5',
        badgeClass: 'bg-red-500/10 text-red-400',
      }
    case 'confirmed':
      return {
        label: 'Confirmado',
        emoji: '🟢',
        borderClass: 'border-emerald-500/30',
        bgClass: 'bg-emerald-500/5',
        badgeClass: 'bg-emerald-500/10 text-emerald-400',
      }
    default:
      return {
        label: status,
        emoji: '⚫',
        borderClass: 'border-white/10',
        bgClass: 'bg-white/5',
        badgeClass: 'bg-white/10 text-text-secondary',
      }
  }
}

export function WaitingListCard({ entry, role }: WaitingListCardProps) {
  const [isPending, startTransition] = useTransition()
  const statusConfig = getStatusConfig(entry.status)
  const barberColor = getBarberColor(entry.barber?.full_name)

  function handleNotify() {
    startTransition(async () => {
      const result = await notifyClient(entry.id)
      if (result.error) {
        toast.error(result.error)
      } else if (result.whatsappData) {
        toast.success(`${entry.client?.full_name || 'Cliente'} foi notificado!`)
        openWhatsApp(result.whatsappData)
      }
    })
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await leaveQueue(entry.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Removido da fila')
      }
    })
  }

  function handleSkip() {
    startTransition(async () => {
      const result = await expireAndSkip(entry.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Cliente pulado, próximo será notificado')
      }
    })
  }

  function handleConfirm() {
    startTransition(async () => {
      const result = await confirmQueueSpot(entry.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Vaga confirmada! Seu agendamento foi criado.')
      }
    })
  }

  function handleExpire() {
    startTransition(async () => {
      const result = await expireAndSkip(entry.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.info('Tempo expirado, próximo na fila será notificado')
      }
    })
  }

  const isAdminOrBarber = role === 'admin' || role === 'barber'

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 transition-all duration-300',
        statusConfig.borderClass,
        statusConfig.bgClass,
        isPending && 'opacity-50 pointer-events-none'
      )}
    >
      {/* Header: position + name + wait time */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-syne font-bold text-lg text-accent-cyan">
            #{entry.position}
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-bold text-base truncate">
              {entry.client?.full_name || 'Cliente'}
            </h3>
            <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
              <Scissors size={12} weight="duotone" />
              <span className="truncate">{entry.service?.name || 'Serviço'}</span>
              <span className="text-white/20">|</span>
              {entry.barber ? (
                <span className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: barberColor }}
                  />
                  <span className="truncate">{entry.barber.full_name}</span>
                  <span className="text-white/30">(preferido)</span>
                </span>
              ) : (
                <span className="text-text-secondary">Qualquer barbeiro</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-text-secondary flex-shrink-0">
          <Clock size={14} weight="duotone" />
          <span className="text-xs font-medium">
            {entry.estimated_wait_minutes ? `${entry.estimated_wait_minutes}min espera` : '--'}
          </span>
        </div>
      </div>

      {/* Phone + Status */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {isAdminOrBarber && entry.client?.phone && (
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Phone size={12} weight="duotone" />
            <span className="text-xs font-mono">{entry.client.phone}</span>
          </div>
        )}
        <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium', statusConfig.badgeClass)}>
          <span>{statusConfig.emoji}</span>
          <span>{statusConfig.label}</span>
        </div>
      </div>

      {/* Timer (if notified) */}
      {entry.status === 'notified' && entry.expires_at && (
        <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/5">
          <QueueTimer expiresAt={entry.expires_at} onExpire={handleExpire} />
        </div>
      )}

      {/* Arrived at */}
      {entry.arrived_at && (
        <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-4">
          <User size={12} weight="duotone" />
          <span>Entrou às {formatTime(entry.arrived_at)}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
        {isAdminOrBarber && entry.status === 'waiting' && (
          <>
            <button
              onClick={handleNotify}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors text-sm font-medium"
            >
              <DeviceMobileCamera size={16} weight="duotone" />
              Notificar
            </button>
            <button
              onClick={handleRemove}
              disabled={isPending}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm"
            >
              <X size={14} weight="bold" />
              Remover
            </button>
          </>
        )}

        {isAdminOrBarber && entry.status === 'notified' && (
          <>
            <button
              onClick={handleConfirm}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
            >
              <CheckCircle size={16} weight="duotone" />
              Confirmar Manual
            </button>
            <button
              onClick={handleSkip}
              disabled={isPending}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 text-text-secondary hover:bg-yellow-500/10 hover:text-yellow-400 transition-colors text-sm"
            >
              <FastForward size={14} weight="bold" />
              Pular
            </button>
          </>
        )}

        {entry.status === 'confirmed' && (
          <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium">
            <CheckCircle size={16} weight="duotone" />
            Vaga confirmada
            {entry.served_at && <span className="text-xs opacity-60">— {formatTime(entry.served_at)}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
