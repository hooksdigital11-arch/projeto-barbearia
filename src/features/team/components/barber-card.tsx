'use client'

import { Star, CalendarCheck, Eye, PencilSimple, CurrencyDollar } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import type { TeamMemberWithStats } from '../types'

function hashColor(name: string): string {
  const knownColors: Record<string, string> = {
    'Rafael': '#3b82f6',
    'Thiago': '#f59e0b',
    'Marcos': '#10b981',
  }
  const firstName = (name || '').split(' ')[0] || ''
  if (knownColors[firstName]) return knownColors[firstName]

  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = (name || '').charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = ['#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#84cc16', '#a78bfa']
  return colors[Math.abs(hash) % colors.length] || '#8b5cf6'
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
  const color = hashColor(member.full_name || '')
  const initials = (member.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const isActive = member.status === 'active' || !member.status

  return (
    <div className={cn(
      "group relative bg-white/[0.03] border rounded-[2rem] p-6 transition-all hover:bg-white/[0.06] hover:scale-[1.01]",
      isOwnProfile ? "border-accent-cyan/30 bg-accent-cyan/[0.02]" : "border-white/10"
    )}>
      {/* Color stripe top */}
      <div className="absolute top-0 left-8 right-8 h-1 rounded-b-full opacity-60" style={{ backgroundColor: color }} />

      {isOwnProfile && (
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent-cyan mb-4 block">Seu Perfil</span>
      )}

      {/* Avatar + Name */}
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg"
          style={{ backgroundColor: color }}
        >
          {member.avatar_url ? (
            <img src={member.avatar_url} alt={member.full_name || ''} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-bold text-base truncate">{member.full_name || 'Sem nome'}</h3>
          {member.specialty && (
            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider mt-1 inline-block" style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}>
              {member.specialty === 'corte_barba' ? 'Corte + Barba' : member.specialty}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Star size={14} weight="fill" className="text-amber-400" />
            Rating
          </span>
          <span className="text-white font-bold">{member.avgRating > 0 ? `${member.avgRating} ★` : '—'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <CalendarCheck size={14} className="text-blue-400" />
            Hoje
          </span>
          <span className="text-white font-bold">{member.todayAppointments} agend.</span>
        </div>
        {showRevenue && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <CurrencyDollar size={14} className="text-green-400" />
              Mês
            </span>
            <span className="text-green-400 font-bold">{formatCurrency(member.monthRevenue)}</span>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="mb-5">
        <span className={cn(
          "text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest",
          isActive ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
        )}>
          {isActive ? '● Ativo' : '● Inativo'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onView(member)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:bg-white/10 transition-all"
        >
          <Eye size={14} />
          {canManage || isOwnProfile ? 'Detalhes' : 'Ver Agenda'}
        </button>
        {(canManage || isOwnProfile) && (
          <button
            onClick={() => onEdit(member)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/20 transition-all"
          >
            <PencilSimple size={14} />
            Editar
          </button>
        )}
      </div>
    </div>
  )
}
