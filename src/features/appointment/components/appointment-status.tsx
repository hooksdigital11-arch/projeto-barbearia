'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
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

export function StatusBadge({ status, appointmentId, interactive = false }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  
  // Minimalist semantic colors
  const semanticColors: Record<string, { bg: string, text: string, border: string }> = {
    scheduled: { bg: '#111', text: '#555', border: '#1e1e1e' },
    in_progress: { bg: '#2e260d', text: '#f59e0b', border: '#f59e0b33' },
    completed: { bg: '#0d2e29', text: 'var(--accent, #00d4aa)', border: 'var(--accent-20, #00d4aa33)' },
    cancelled: { bg: '#2e0d0d', text: '#ef4444', border: '#ef444433' },
    no_show: { bg: '#111', text: '#333', border: '#1e1e1e' },
  }

  const colors = semanticColors[status] || semanticColors.scheduled

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
}: {
  status: AppointmentStatus
  appointmentId: string
}) {
  const [isPending, startTransition] = useTransition()
  const nextStatus = STATUS_NEXT[status]

  if (!nextStatus) return null

  const label = STATUS_ACTION_LABEL[status] || 'Avançar'

  const handleAdvance = () => {
    startTransition(async () => {
      const fd = new FormData()
      fd.append('id', appointmentId)
      fd.append('status', nextStatus)
      const res = await updateAppointmentStatus(fd)
      if (res.error) toast.error(res.error)
      else toast.success(`Status: ${STATUS_CONFIG[nextStatus].label}`)
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
  const [isPending, startTransition] = useTransition()

  const handleCancel = () => {
    if (!confirm('Cancelar este agendamento?')) return
    startTransition(async () => {
      const res = await cancelAppointment(appointmentId)
      if (res.error) toast.error(res.error)
      else toast.success('Agendamento cancelado')
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
