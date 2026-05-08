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
  
  // Custom semantic colors for premium look
  const semanticColors: Record<string, { bg: string, text: string }> = {
    scheduled: { bg: 'rgba(59, 130, 246, 0.08)', text: '#3b82f6' },
    in_progress: { bg: 'rgba(245, 158, 11, 0.08)', text: '#f59e0b' },
    completed: { bg: 'rgba(16, 185, 129, 0.08)', text: '#10b981' },
    cancelled: { bg: 'rgba(239, 68, 68, 0.08)', text: '#ef4444' },
    no_show: { bg: 'rgba(255, 255, 255, 0.08)', text: '#888888' },
  }

  const colors = semanticColors[status] || { bg: 'rgba(255, 255, 255, 0.08)', text: '#888888' }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.1em]'
      )}
      style={{ backgroundColor: colors.bg, color: colors.text }}
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
      className="btn-pill-primary px-4 py-1.5 text-[10px] uppercase tracking-widest disabled:opacity-50 h-auto"
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
      className="btn-pill-secondary px-4 py-1.5 text-[10px] uppercase tracking-widest border-red-500/50 text-red-400 hover:bg-red-500/10 h-auto"
    >
      {isPending ? '...' : 'Cancelar'}
    </button>
  )
}
