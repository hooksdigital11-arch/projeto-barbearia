'use client'

import Link from 'next/link'
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  const first = parts[0] ?? ''
  const last = parts[parts.length - 1] ?? ''
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase()
}

export function ClientCard({ client, basePath, showFinancials }: ClientCardProps) {
  return (
    <Link
      href={`${basePath}/${client.id}`}
      className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[10px] p-[18px] group hover:bg-bg-surface hover:border-[#222] transition-all"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative w-[38px] h-[38px] rounded-full bg-[#1e1e2e] flex items-center justify-center shrink-0">
            <span className="text-[12px] font-medium text-[#8b7cf6]">
              {getInitials(client.full_name || '')}
            </span>
            {client.status === 'active' && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-accent-main border-[1.5px] border-[#0f0f0f]" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-medium text-text-primary truncate uppercase tracking-[0.02em] group-hover:text-accent-main transition-colors">
              {client.full_name}
            </span>
            <span className="text-[9px] text-[#2a2a2a] font-medium truncate uppercase">
              {client.phone || 'SEM TELEFONE'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-4 border-t-[0.5px] border-border-main">
        <div className="flex flex-col">
          <span className="text-[8px] text-[#2a2a2a] font-medium uppercase tracking-[0.07em]">VISITAS</span>
          <span className="text-[12px] font-medium text-text-secondary">{client.total_visits || 0}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] text-[#2a2a2a] font-medium uppercase tracking-[0.07em]">ÚLTIMA</span>
          <span className="text-[12px] font-medium text-text-secondary">{formatDate(client.last_visit_at)}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] text-[#2a2a2a] font-medium uppercase tracking-[0.07em]">TOTAL</span>
          <span className="text-[12px] font-medium text-text-secondary">
            {showFinancials ? formatCurrency(client.total_spent_cents || 0).replace('R$', '').trim() : '---'}
          </span>
        </div>
      </div>
    </Link>
  )
}
