'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { DotsThreeVertical, CaretRight } from '@phosphor-icons/react'
import { ClientAvatar } from './client-avatar'
import type { ClientRecord } from '../types'

interface ClientsTableProps {
  clients: ClientRecord[]
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
    year: '2-digit',
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

export function ClientsTable({ clients, basePath, showFinancials }: ClientsTableProps) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="text-left text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-8 py-6">Cliente</th>
              <th className="text-left text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-8 py-6">Telefone</th>
              <th className="text-left text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-8 py-6">Status</th>
              <th className="text-center text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-8 py-6">Visitas</th>
              <th className="text-left text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-8 py-6">Última</th>
              {showFinancials && (
                <th className="text-right text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-8 py-6">Total</th>
              )}
              <th className="w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {clients.map(client => (
              <tr
                key={client.id}
                className="group/row hover:bg-white/[0.03] transition-all duration-300"
              >
                <td className="px-8 py-6">
                  <Link
                    href={`${basePath}/${client.id}`}
                    className="flex items-center gap-4 min-w-0"
                  >
                    <div className="relative group-hover/row:scale-110 transition-transform duration-500">
                       <ClientAvatar name={client.full_name} size="sm" />
                       <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0a0a0a]" style={{ backgroundColor: client.status === 'active' ? '#10b981' : '#a0a0a0' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-white truncate group-hover/row:text-accent-cyan transition-colors">
                        {client.full_name}
                      </p>
                      {client.email && (
                        <p className="text-xs text-text-secondary truncate font-medium mt-0.5 opacity-60">{client.email}</p>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm text-text-secondary font-mono font-medium tracking-tight">
                    {client.phone || '--'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    'text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border',
                    client.status === 'active' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' :
                    client.status === 'blocked' ? 'bg-red-500/5 border-red-500/10 text-red-400' :
                    'bg-white/5 border-white/10 text-text-secondary'
                  )}>
                    {statusLabel[client.status]}
                  </span>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="text-base font-black text-white">{client.total_visits || 0}</span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm text-text-secondary font-medium">
                    {formatDate(client.last_visit_at)}
                  </span>
                </td>
                {showFinancials && (
                  <td className="px-8 py-6 text-right">
                    <span className="text-base font-black text-accent-cyan tracking-tight">
                      {formatCurrency(client.total_spent_cents || 0)}
                    </span>
                  </td>
                )}
                <td className="px-8 py-6 text-right">
                  <Link
                    href={`${basePath}/${client.id}`}
                    className="tap-target glass rounded-xl text-text-secondary hover:text-white hover:bg-white/10 transition-all inline-flex opacity-0 group-hover/row:opacity-100"
                  >
                    <CaretRight size={18} weight="bold" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
