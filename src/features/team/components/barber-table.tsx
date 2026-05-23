'use client'

import { Star, Eye, PencilSimple } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import type { TeamMemberWithStats } from '../types'

function getMemberColor(name: string): string {
  const nameMap: Record<string, string> = {
    'Admin': '#1a6b6b',
    'Davi': '#2e7d32',
    'João': '#5c35a0',
    'Test': '#7c4a8a'
  }
  const firstName = name.split(' ')[0] ?? ''
  return nameMap[firstName] ?? '#1a1400'
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

interface BarberTableProps {
  members: TeamMemberWithStats[]
  onView: (m: TeamMemberWithStats) => void
  onEdit: (m: TeamMemberWithStats) => void
  canManage: boolean
  showRevenue: boolean
}

export function BarberTable({ members, onView, onEdit, canManage, showRevenue }: BarberTableProps) {
  return (
    <div className="space-y-[4px]">
      {members.map((member) => {
        const color = getMemberColor(member.full_name || '')
        const initials = (member.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        const isActive = member.status === 'active' || !member.status

        return (
          <div
            key={member.id}
            className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] group hover:bg-bg-surface transition-all"
          >
            {/* Mobile card layout */}
            <div className="lg:hidden p-[14px] flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-text-primary font-medium text-[11px] shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-medium text-text-secondary uppercase tracking-tight truncate">{member.full_name}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={cn("w-[4px] h-[4px] rounded-full", isActive ? "bg-accent-main" : "bg-red-500")} />
                      <span className={cn("text-[9px] font-medium uppercase tracking-[0.05em]", isActive ? "text-accent-main" : "text-red-500/70")}>
                        {isActive ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-0 -mr-2 shrink-0">
                  <button onClick={() => onView(member)} className="w-11 h-11 flex items-center justify-center text-[#2e2e2e] hover:text-[#666] transition-all" title="Ver detalhes">
                    <Eye size={14} />
                  </button>
                  {canManage && (
                    <button onClick={() => onEdit(member)} className="w-11 h-11 flex items-center justify-center text-[#2e2e2e] hover:text-[#666] transition-all" title="Editar">
                      <PencilSimple size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 pl-[44px] text-[10px] text-[#444] font-medium uppercase">
                <span>Hoje: {member.todayAppointments}</span>
                {showRevenue && (
                  <span className="text-accent-main">{formatCurrency(member.monthRevenue).replace('R$', 'R$').trim()}</span>
                )}
                {member.avgRating > 0 && (
                  <div className="flex items-center gap-1 text-amber-400">
                    <span>{member.avgRating}</span>
                    <Star size={10} weight="fill" />
                  </div>
                )}
              </div>
            </div>

            {/* Desktop table row */}
            <div className="hidden lg:grid grid-cols-[2fr_1.2fr_80px_60px_100px_80px_70px] gap-[12px] items-center py-[13px] px-[18px]">
              <div className="flex items-center gap-3">
                <div
                  className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-text-primary font-medium text-[11px] shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {initials}
                </div>
                <span className="text-[12px] font-medium text-text-secondary uppercase tracking-tight truncate">{member.full_name}</span>
              </div>

              <div>
                {member.specialty === 'barba' ? (
                  <span className="text-[9px] px-2 py-0.5 rounded-[4px] bg-[#0d2419] text-[#00c070] border-[0.5px] border-[#00c07033] font-medium uppercase tracking-wider">Barba</span>
                ) : member.specialty === 'corte_barba' ? (
                  <span className="text-[9px] px-2 py-0.5 rounded-[4px] bg-[#12142a] text-[#6b8fff] border-[0.5px] border-[#6b8fff33] font-medium uppercase tracking-wider">Corte e Barba</span>
                ) : (
                  <span className="text-[9px] px-2 py-0.5 rounded-[4px] bg-bg-surface text-[#333] font-medium uppercase tracking-wider">Vazio</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <div className={cn("w-[5px] h-[5px] rounded-full", isActive ? "bg-accent-main" : "bg-red-500")} />
                <span className={cn("text-[9px] font-medium uppercase tracking-[0.05em]", isActive ? "text-accent-main" : "text-red-500/70")}>
                  {isActive ? 'ATÍVO' : 'INATIVO'}
                </span>
              </div>

              <div className="text-center">
                <span className="text-[11px] font-medium text-text-secondary tabular-nums">{member.todayAppointments}</span>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-medium text-accent-main tabular-nums">
                  {formatCurrency(member.monthRevenue).replace('R$', '').trim()}
                </span>
              </div>

              <div className="flex justify-center">
                {member.avgRating > 0 ? (
                  <div className="flex items-center gap-1 text-amber-400">
                    <span className="text-[11px] font-medium tabular-nums">{member.avgRating}</span>
                    <Star size={10} weight="fill" />
                  </div>
                ) : (
                  <span className="text-[11px] text-[#2e2e2e]">—</span>
                )}
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button onClick={() => onView(member)} className="text-[#2e2e2e] hover:text-[#666] transition-all" title="Ver detalhes">
                  <Eye size={14} />
                </button>
                {canManage && (
                  <button onClick={() => onEdit(member)} className="text-[#2e2e2e] hover:text-[#666] transition-all" title="Editar">
                    <PencilSimple size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
