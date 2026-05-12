'use client'

import { UsersThree, UserCheck, CalendarCheck, Star } from '@phosphor-icons/react'
import type { TeamStats } from '../types'

export function TeamStatsCards({ stats }: { stats: TeamStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {[
        { label: 'TOTAL DA EQUIPE', value: stats.total, icon: UsersThree, desc: 'Profissionais cadastrados' },
        { label: 'ATIVOS AGORA', value: stats.active, icon: UserCheck, desc: 'Disponíveis para escala' },
        { label: 'AGENDAMENTOS', value: stats.todayAppointments, icon: CalendarCheck, desc: 'Volume de hoje' },
        { label: 'RATING MÉDIO', value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '5.0', icon: Star, desc: 'Satisfação dos clientes', isRating: true },
      ].map((kpi, idx) => (
        <div key={idx} className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px] px-[18px] flex flex-col justify-between h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-medium text-[#383838] tracking-[0.12em] uppercase">{kpi.label}</span>
            <kpi.icon size={14} weight="regular" className="text-accent-main opacity-35" />
          </div>
          <div className="space-y-1">
            <div className="text-[26px] text-text-primary font-medium flex items-center gap-1.5 leading-none">
              {kpi.value}
              {kpi.isRating && (
                <span className="text-[16px] text-[#d4aa00]">★</span>
              )}
            </div>
            <p className="text-[8px] text-[#2a2a2a] tracking-[0.07em] font-medium uppercase">{kpi.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
