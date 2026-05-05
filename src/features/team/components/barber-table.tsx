'use client'

import { Star, Eye, PencilSimple } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import type { TeamMemberWithStats } from '../types'

function hashColor(name: string): string {
  const knownColors: Record<string, string> = { 'Rafael': '#3b82f6', 'Thiago': '#f59e0b', 'Marcos': '#10b981' }
  const firstName = (name || '').split(' ')[0]
  if (knownColors[firstName]) return knownColors[firstName]
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = (name || '').charCodeAt(i) + ((hash << 5) - hash)
  const colors = ['#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#84cc16', '#a78bfa']
  return colors[Math.abs(hash) % colors.length]
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
  if (members.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-20 text-center space-y-4">
        <p className="text-white font-bold">Nenhum membro encontrado</p>
        <p className="text-sm text-muted-foreground">A equipe aparecerá aqui.</p>
      </div>
    )
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nome</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Especialidade</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Hoje</th>
              {showRevenue && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Mês R$</th>}
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Rating</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {members.map((member) => {
              const color = hashColor(member.full_name || '')
              const initials = (member.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              const isActive = member.status === 'active' || !member.status

              return (
                <tr key={member.id} className="hover:bg-white/[0.03] transition-all">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {initials}
                      </div>
                      <span className="text-white font-bold text-sm">{member.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider" style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}>
                      {member.specialty === 'corte_barba' ? 'Corte + Barba' : member.specialty || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={cn(
                      "text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest",
                      isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    )}>
                      {isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center text-white font-bold text-sm">{member.todayAppointments}</td>
                  {showRevenue && (
                    <td className="px-6 py-5 text-right text-green-400 font-bold text-sm">{formatCurrency(member.monthRevenue)}</td>
                  )}
                  <td className="px-6 py-5 text-center">
                    <span className="text-amber-400 font-bold text-sm">
                      {member.avgRating > 0 ? (
                        <span className="flex items-center gap-1 justify-center">
                          <Star size={12} weight="fill" />
                          {member.avgRating}
                        </span>
                      ) : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => onView(member)} className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-all" title="Ver detalhes">
                        <Eye size={16} />
                      </button>
                      {canManage && (
                        <button onClick={() => onEdit(member)} className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-all" title="Editar">
                          <PencilSimple size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
