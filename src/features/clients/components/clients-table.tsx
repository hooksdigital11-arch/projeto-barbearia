'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  const first = parts[0] ?? ''
  const last = parts[parts.length - 1] ?? ''
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase()
}

export function ClientsTable({ clients, basePath, showFinancials }: ClientsTableProps) {
  // Shared grid style to ensure perfect alignment
  const gridStyle = "grid grid-cols-[2fr_1.2fr_100px_80px_90px_100px] gap-4" // gap-4 = 16px

  return (
    <div className="space-y-6">
      {/* Column Header */}
      <div className={cn(gridStyle, "px-[18px] pb-2")}>
        <span className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.1em]">CLIENTE</span>
        <span className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.1em]">TELEFONE</span>
        <span className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.1em]">STATUS</span>
        <span className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.1em] text-center">VISITAS</span>
        <span className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.1em]">ÚLTIMA</span>
        <span className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.1em] text-right">TOTAL</span>
      </div>

      <div className="space-y-[2px]">
        {clients.map(client => (
          <Link
            key={client.id}
            href={`${basePath}/${client.id}`}
            className={cn(
              gridStyle,
              "py-[12px] px-[18px] items-center bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] group hover:bg-bg-surface hover:border-[#222] transition-all"
            )}
          >
            {/* Info Box */}
            <div className="flex items-center gap-[10px] min-w-0 overflow-hidden">
              <div className="relative w-8 h-8 rounded-full bg-[#1e1e2e] flex items-center justify-center shrink-0">
                <span className="text-[11px] font-medium text-[#8b7cf6]">
                  {getInitials(client.full_name || '')}
                </span>
                {client.status === 'active' && (
                  <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-accent-main border-[1.5px] border-[#0f0f0f]" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-medium text-text-primary truncate uppercase tracking-[0.02em]">
                  {client.full_name}
                </span>
                <span className="text-[9px] text-[#2a2a2a] font-medium truncate uppercase">
                  {client.email || 'SEM EMAIL'}
                </span>
              </div>
            </div>

            {/* Phone */}
            <span className="text-[11px] text-[#444] font-medium truncate whitespace-nowrap">
              {client.phone || '--'}
            </span>

            {/* Status */}
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-[5px] h-[5px] rounded-full",
                client.status === 'active' ? "bg-accent-main" : "bg-[#2a2a2a]"
              )} />
              <span className={cn(
                "text-[9px] font-medium uppercase tracking-[0.05em]",
                client.status === 'active' ? "text-accent-main" : "text-[#2a2a2a]"
              )}>
                {client.status === 'active' ? 'ATIVO' : 'INATIVO'}
              </span>
            </div>

            {/* Visits */}
            <span className="text-[13px] font-medium text-text-primary text-center">
              {client.total_visits || 0}
            </span>

            {/* Last Visit */}
            <span className="text-[11px] text-[#444] font-medium uppercase tracking-tight">
              {formatDate(client.last_visit_at)}
            </span>

            {/* Total */}
            <span className="text-[12px] font-medium text-text-secondary text-right tracking-tight">
              {showFinancials ? formatCurrency(client.total_spent_cents || 0) : '---'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
