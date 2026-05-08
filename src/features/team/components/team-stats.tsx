'use client'

import { UsersThree, UserCheck, CalendarCheck, Star } from '@phosphor-icons/react'
import type { TeamStats } from '../types'

export function TeamStatsCards({ stats }: { stats: TeamStats }) {
  const cards = [
    {
      label: 'Total da Equipe',
      value: stats.total,
      icon: UsersThree,
      color: 'text-accent-cyan',
      bgColor: 'bg-accent-cyan/10 border-accent-cyan/20',
    },
    {
      label: 'Ativos',
      value: stats.active,
      icon: UserCheck,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20',
    },
    {
      label: 'Agendamentos Hoje',
      value: stats.todayAppointments,
      icon: CalendarCheck,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Rating Médio',
      value: stats.avgRating > 0 ? `${stats.avgRating} ★` : '—',
      icon: Star,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        { label: 'Total da Equipe', value: stats.total, icon: UsersThree, color: '#8b5cf6', desc: 'Profissionais cadastrados' },
        { label: 'Ativos Agora', value: stats.active, icon: UserCheck, color: '#10b981', desc: 'Disponíveis para escala' },
        { label: 'Agendamentos', value: stats.todayAppointments, icon: CalendarCheck, color: '#3b82f6', desc: 'Volume de hoje' },
        { label: 'Rating Médio', value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} ★` : '5.0 ★', icon: Star, color: '#ffcc00', desc: 'Satisfação dos clientes' },
      ].map((kpi, idx) => (
        <div key={idx} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-white/[0.03] border border-white/10 group-hover:scale-110 transition-transform">
              <kpi.icon size={24} weight="duotone" style={{ color: kpi.color }} />
            </div>
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{kpi.label}</h4>
            <p className="text-4xl font-bold text-white tabular-nums tracking-tighter">{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest opacity-50">{kpi.desc}</p>
          </div>
          <div className="absolute -bottom-2 -right-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
            <kpi.icon size={80} weight="duotone" />
          </div>
        </div>
      ))}
    </div>
  )
}
