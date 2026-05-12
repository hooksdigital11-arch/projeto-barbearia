'use client'

import { Star, CalendarCheck, Eye, PencilSimple, CurrencyDollar } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import type { TeamMemberWithStats } from '../types'

function getMemberColor(name: string): string {
  const nameMap: Record<string, string> = {
    'Admin': '#1a6b6b',
    'Davi': '#2e7d32',
    'João': '#5c35a0',
    'Test': '#7c4a8a'
  }
  const firstName = name.split(' ')[0]
  return nameMap[firstName] || '#1a1400'
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

interface BarberCardProps {
  member: TeamMemberWithStats
  onView: (m: TeamMemberWithStats) => void
  onEdit: (m: TeamMemberWithStats) => void
  canManage: boolean
  showRevenue: boolean
  isOwnProfile?: boolean
}

export function BarberCard({ member, onView, onEdit, canManage, showRevenue, isOwnProfile }: BarberCardProps) {
  const color = getMemberColor(member.full_name || '')
  const initials = (member.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const isActive = member.status === 'active' || !member.status

  return (
    <div className={cn(
      "relative bg-bg-sidebar border border-border-main rounded-[10px] p-[18px] transition-all hover:border-[#222] group flex flex-col",
      isOwnProfile && "border-accent-main/20"
    )}>
      {/* Top color line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[10px]" 
        style={{ backgroundColor: color }} 
      />

      {/* Avatar + Name */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-[38px] h-[38px] rounded-[8px] flex items-center justify-center text-text-primary font-medium text-[12px] shrink-0"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-medium text-text-secondary truncate uppercase tracking-tight">{member.full_name || 'SEM NOME'}</h3>
          <p className="text-[9px] text-[#333] font-medium uppercase tracking-wider">{member.specialty?.replace('_', ' ') || 'EQUIPE'}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-6 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star size={12} className="text-[#333]" />
            <span className="text-[10px] font-medium text-[#333] uppercase">RATING</span>
          </div>
          <span className="text-[11px] font-medium text-text-secondary">{member.avgRating > 0 ? `${member.avgRating} ★` : '—'}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck size={12} className="text-[#333]" />
            <span className="text-[10px] font-medium text-[#333] uppercase">HOJE</span>
          </div>
          <span className="text-[11px] font-medium text-text-secondary">{member.todayAppointments}</span>
        </div>

        {showRevenue && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CurrencyDollar size={12} className="text-[#333]" />
              <span className="text-[10px] font-medium text-[#333] uppercase">MÊS</span>
            </div>
            <span className="text-[11px] font-medium text-accent-main">{formatCurrency(member.monthRevenue)}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-[12px] border-t border-border-main/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={cn("w-[5px] h-[5px] rounded-full", isActive ? "bg-accent-main" : "bg-red-500")} />
          <span className={cn("text-[9px] font-medium uppercase tracking-[0.05em]", isActive ? "text-accent-main" : "text-red-500/70")}>
            {isActive ? 'ATIVO' : 'INATIVO'}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onView(member)}
            className="flex items-center gap-1.5 px-[12px] py-[6px] bg-bg-sidebar border border-border-main rounded-[6px] text-[9px] font-medium text-[#444] tracking-[0.07em] uppercase hover:text-[#666] hover:border-[#333] transition-all"
          >
            <Eye size={10} />
            DETALHES
          </button>
          {(canManage || isOwnProfile) && (
            <button
              onClick={() => onEdit(member)}
              className="flex items-center gap-1.5 px-[12px] py-[6px] bg-bg-sidebar border border-border-main rounded-[6px] text-[9px] font-medium text-[#444] tracking-[0.07em] uppercase hover:text-[#666] hover:border-[#333] transition-all"
            >
              <PencilSimple size={10} />
              EDITAR
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
