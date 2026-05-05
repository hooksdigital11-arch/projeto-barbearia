'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { DotsThreeVertical } from '@phosphor-icons/react'
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
    <div className="rounded-2xl border border-white/5 bg-card/20 backdrop-blur-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs font-medium text-text-secondary px-5 py-4">Cliente</th>
              <th className="text-left text-xs font-medium text-text-secondary px-5 py-4">Telefone</th>
              <th className="text-left text-xs font-medium text-text-secondary px-5 py-4">Status</th>
              <th className="text-center text-xs font-medium text-text-secondary px-5 py-4">Visitas</th>
              <th className="text-left text-xs font-medium text-text-secondary px-5 py-4">Última</th>
              {showFinancials && (
                <th className="text-right text-xs font-medium text-text-secondary px-5 py-4">Total</th>
              )}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr
                key={client.id}
                className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors group"
              >
                <td className="px-5 py-4">
                  <Link
                    href={`${basePath}/${client.id}`}
                    className="flex items-center gap-3 min-w-0"
                  >
                    <ClientAvatar name={client.full_name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-accent-cyan transition-colors">
                        {client.full_name}
                      </p>
                      {client.email && (
                        <p className="text-xs text-text-secondary truncate">{client.email}</p>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-text-secondary font-mono">
                    {client.phone || '--'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={cn(
                    'text-[10px] font-medium px-2 py-0.5 rounded-md',
                    statusBadge[client.status]
                  )}>
                    {statusLabel[client.status]}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="text-sm font-bold text-white">{client.total_visits || 0}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-text-secondary">
                    {formatDate(client.last_visit_at)}
                  </span>
                </td>
                {showFinancials && (
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-bold text-accent-cyan">
                      {formatCurrency(client.total_spent_cents || 0)}
                    </span>
                  </td>
                )}
                <td className="px-5 py-4">
                  <Link
                    href={`${basePath}/${client.id}`}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors inline-flex"
                  >
                    <DotsThreeVertical size={16} weight="bold" />
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
