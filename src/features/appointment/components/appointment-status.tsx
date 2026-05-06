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
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
        cfg.bg
      )}
      style={{ color: cfg.color }}
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
      className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors disabled:opacity-50"
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
      className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
    >
      {isPending ? '...' : 'Cancelar'}
    </button>
  )
}
