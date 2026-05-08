'use client'

import { UsersThree, UserCheck, CalendarCheck, Star } from '@phosphor-icons/react'
import type { TeamStats } from '../types'

export function TeamStatsCards({ stats }: { stats: TeamStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 overflow-hidden">
      {[
        { label: 'Total da Equipe', value: stats.total, icon: UsersThree, color: '#8b5cf6', desc: 'Profissionais cadastrados' },
        { label: 'Ativos Agora', value: stats.active, icon: UserCheck, color: '#10b981', desc: 'Disponíveis para escala' },
        { label: 'Agendamentos', value: stats.todayAppointments, icon: CalendarCheck, color: '#3b82f6', desc: 'Volume de hoje' },
        { label: 'Rating Médio', value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} ★` : '5.0 ★', icon: Star, color: '#ffcc00', desc: 'Satisfação dos clientes' },
      ].map((kpi, idx) => (
        <div key={idx} className="p-10 bg-black flex flex-col justify-between h-48 group">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
              {kpi.label}
            </p>
            <kpi.icon size={20} weight="bold" style={{ color: kpi.color }} className="opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <p className="text-5xl font-bold font-mono text-white tracking-tighter group-hover:text-accent-cyan transition-colors">
              {kpi.value}
            </p>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest opacity-30 group-hover:opacity-60 transition-opacity">
              {kpi.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
