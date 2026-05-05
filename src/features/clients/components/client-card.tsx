'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { Phone, Calendar, Scissors } from '@phosphor-icons/react'
import { ClientAvatar } from './client-avatar'
import type { ClientRecord } from '../types'

interface ClientCardProps {
  client: ClientRecord
  basePath: string
  showFinancials: boolean
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
}

const statusBadge = {
  active: 'bg-emerald-500/10 text-emerald-400',
  blocked: 'bg-red-500/10 text-red-400',
  inactive: 'bg-white/10 text-text-secondary',
}

const statusLabel = {
  active: 'Ativo',
  blocked: 'Bloqueado',
  inactive: 'Inativo',
}

export function ClientCard({ client, basePath, showFinancials }: ClientCardProps) {
  return (
    <Link
      href={`${basePath}/${client.id}`}
      className={cn(
        'group block rounded-2xl border border-white/5 bg-card/20 backdrop-blur-xl p-5',
        'transition-all duration-300 hover:border-accent-cyan/30 hover:bg-card/30',
        'hover:shadow-lg hover:shadow-accent-cyan/5'
      )}
    >
      {/* Top: Avatar + Name + Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <ClientAvatar name={client.full_name} size="lg" />
          <div className="min-w-0">
            <h3 className="text-white font-bold truncate group-hover:text-accent-cyan transition-colors">
              {client.full_name}
            </h3>
            {client.phone && (
              <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                <Phone size={11} weight="duotone" />
                {client.phone}
              </p>
            )}
          </div>
        </div>
        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-md', statusBadge[client.status])}>
          {statusLabel[client.status]}
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-2.5 rounded-xl bg-white/5 text-center">
          <p className="text-xs text-text-secondary flex items-center justify-center gap-1 mb-0.5">
            <Scissors size={10} weight="duotone" />
            Visitas
          </p>
          <p className="text-sm font-bold text-white">{client.total_visits || 0}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 text-center">
          <p className="text-xs text-text-secondary flex items-center justify-center gap-1 mb-0.5">
            <Calendar size={10} weight="duotone" />
            Última
          </p>
          <p className="text-sm font-bold text-white">{formatDate(client.last_visit_at)}</p>
        </div>
        {showFinancials && (
          <div className="p-2.5 rounded-xl bg-white/5 text-center">
            <p className="text-xs text-text-secondary mb-0.5">Total</p>
            <p className="text-sm font-bold text-accent-cyan">
              {formatCurrency(client.total_spent_cents || 0)}
            </p>
          </div>
        )}
        {!showFinancials && (
          <div className="p-2.5 rounded-xl bg-white/5 text-center">
            <p className="text-xs text-text-secondary mb-0.5">Barbeiro</p>
            <p className="text-sm font-bold text-white truncate">
              {client.preferred_barber?.full_name || '--'}
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}
