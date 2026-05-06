'use client'

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell
} from 'recharts'
import type { TeamReport } from '../types'
import { Star, Medal, Crown } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils/cn'

interface TeamSectionProps {
  data: TeamReport
}

export function TeamSection({ data }: TeamSectionProps) {
  const { barbers, revenueComparison, weeklyEvolution, serviceDistribution } = data

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown size={20} weight="duotone" className="text-yellow-400" />
    if (index === 1) return <Medal size={20} weight="duotone" className="text-gray-300" />
    if (index === 2) return <Medal size={20} weight="duotone" className="text-amber-600" />
    return <span className="text-text-secondary font-bold">#{index + 1}</span>
  }

  return (
    <section className="space-y-6 pt-12 border-t border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-accent-cyan rounded-full" />
        <h2 className="text-xl font-syne font-bold text-white uppercase tracking-tight">Equipe</h2>
      </div>

      {/* Barber Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((barber) => (
          <div key={barber.id} className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-accent-cyan/10 flex items-center justify-center text-accent-cyan font-bold text-xl uppercase shrink-0">
                {barber.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-syne font-bold text-white">{barber.name}</h3>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={14} weight="fill" />
                  <span className="text-sm font-bold">{barber.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Atendimentos</p>
                <p className="text-xl font-bold text-white">{barber.appointments}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Receita</p>
                <p className="text-xl font-bold text-accent-cyan">R$ {barber.revenue.toLocaleString('pt-BR')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Conclusão</p>
                <p className="text-sm font-bold text-white">{barber.completionRate}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Cancelamentos</p>
                <p className="text-sm font-bold text-red-400">{barber.cancellations}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Comparison */}
        <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Comparativo de Receita</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {revenueComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Evolution */}
        <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Evolução Semanal</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                {barbers.map((barber, index) => (
                  <Line 
                    key={barber.id}
                    type="monotone" 
                    dataKey={barber.name} 
                    stroke={index === 0 ? '#3b82f6' : index === 1 ? '#f59e0b' : '#10b981'}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Distribuição de Serviços</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serviceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="barberName" stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              />
              <Legend />
              <Bar dataKey="Corte" stackId="a" fill="#00e5ff" />
              <Bar dataKey="Barba" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Combo" stackId="a" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
