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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bgColor} border rounded-[2rem] p-6 transition-all hover:scale-[1.02]`}
        >
          <div className={`w-10 h-10 rounded-2xl bg-black/20 flex items-center justify-center ${card.color} mb-4`}>
            <card.icon size={22} weight="duotone" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{card.label}</p>
          <p className="text-2xl font-bold text-white mt-1 font-syne">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
