'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useConfirm } from '@/components/providers/confirm-provider'
import { updateAppointmentStatus, cancelAppointment } from '../actions'
import type { AppointmentStatus } from '../types'
import { STATUS_CONFIG } from '../types'
import { cn } from '@/lib/utils/cn'

interface StatusBadgeProps {
  status: AppointmentStatus
  appointmentId: string
  interactive?: boolean
}

const STATUS_NEXT: Partial<Record<AppointmentStatus, AppointmentStatus>> = {
  scheduled: 'in_progress',
  in_progress: 'completed',
}

const STATUS_ACTION_LABEL: Partial<Record<AppointmentStatus, string>> = {
  scheduled: 'Iniciar',
  in_progress: 'Finalizar',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  
  // Minimalist semantic colors
  const semanticColors: Record<string, { bg: string, text: string, border: string }> = {
    scheduled: { bg: '#111', text: '#555', border: '#1e1e1e' },
    in_progress: { bg: '#2e260d', text: '#f59e0b', border: '#f59e0b33' },
    completed: { bg: '#0d2e29', text: 'var(--accent, #00d4aa)', border: 'var(--accent-20, #00d4aa33)' },
    cancelled: { bg: '#2e0d0d', text: '#ef4444', border: '#ef444433' },
    no_show: { bg: '#111', text: '#333', border: '#1e1e1e' },
  }

  const colors = semanticColors[status] ?? semanticColors['scheduled']!

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-[6px] text-[10px] font-medium uppercase tracking-[0.08em] border-[0.5px]'
      )}
      style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
    >
      {cfg.label}
    </span>
  )
}

export function QuickStatusButton({
  status,
  appointmentId,
  clientId,
  role = 'barber',
}: {
  status: AppointmentStatus
  appointmentId: string
  clientId?: string
  role?: 'admin' | 'barber'
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const nextStatus = STATUS_NEXT[status]

  if (!nextStatus) return null

  const label = STATUS_ACTION_LABEL[status] || 'Avançar'

  const handleAdvance = () => {
    startTransition(async () => {
      // Se for a ação de finalizar, redirecionamos para o checkout da comanda
      if (status === 'in_progress') {
        const { prepareComandaForAppointment } = await import('@/features/comanda/actions')
        const res = await prepareComandaForAppointment(appointmentId)
        if (res.error) {
          toast.error(res.error)
          return
        }
        if (res.success && res.clientId) {
          router.push(`/${role}/comanda?clientId=${res.clientId}&appointmentId=${appointmentId}`)
          return
        } else {
          toast.error('Não foi possível carregar a comanda')
          return
        }
      }

      const fd = new FormData()
      fd.append('id', appointmentId)
      fd.append('status', nextStatus)
      const res = await updateAppointmentStatus(fd)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`Status: ${STATUS_CONFIG[nextStatus].label}`)
        router.refresh()
      }
    })
  }

  return (
    <button
      onClick={handleAdvance}
      disabled={isPending}
      className="bg-accent-main text-black px-4 py-1.5 rounded-[6px] text-[10px] font-medium uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-50"
    >
      {isPending ? '...' : label}
    </button>
  )
}

export function CancelButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter()
  const confirm = useConfirm()
  const [isPending, startTransition] = useTransition()

  const handleCancel = async () => {
    const ok = await confirm({
      title: 'Cancelar Agendamento',
      message: 'Tem certeza que deseja cancelar este agendamento?',
      variant: 'danger',
      confirmText: 'Cancelar Agendamento',
      cancelText: 'Manter Agendamento'
    })
    if (!ok) return
    
    startTransition(async () => {
      const res = await cancelAppointment(appointmentId)
      if (res.error) toast.error(res.error)
      else {
        toast.success('Agendamento cancelado')
        router.refresh()
      }
    })
  }

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="border-[0.5px] border-[#2e0d0d] text-[#ef4444] px-4 py-1.5 rounded-[6px] text-[10px] font-medium uppercase tracking-wider transition-all hover:bg-[#2e0d0d] disabled:opacity-50"
    >
      {isPending ? '...' : 'Cancelar'}
    </button>
  )
}

interface ConfirmationStageBadgeProps {
  stage?: string | null
}

export function ConfirmationStageBadge({ stage }: ConfirmationStageBadgeProps) {
  if (!stage || stage === 'pendente') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[9px] font-medium uppercase tracking-[0.06em] bg-[#111] text-[#555] border border-[#1e1e1e] shrink-0">
        Pendente
      </span>
    )
  }

  const configs: Record<string, { label: string; bg: string; text: string; border: string }> = {
    '24h_enviado': { label: '24h Enviado', bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.2)' },
    '24h_confirmado': { label: '24h Confirmado', bg: 'rgba(6, 182, 212, 0.1)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.2)' },
    '2h_enviado': { label: '2h Enviado', bg: 'rgba(249, 115, 22, 0.1)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.2)' },
    'confirmado': { label: 'Confirmado', bg: 'rgba(16, 185, 129, 0.1)', text: '#34d399', border: 'rgba(16, 185, 129, 0.2)' },
    'cancelado': { label: 'Cancelado', bg: 'rgba(239, 68, 68, 0.1)', text: '#f87171', border: 'rgba(239, 68, 68, 0.2)' },
  }

  const cfg = configs[stage]
  if (!cfg) return null

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[9px] font-medium uppercase tracking-[0.06em] border-[0.5px] shrink-0"
      style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  )
}

