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
import { ClientOnly } from '@/components/shared/client-only'
import { cn } from '@/lib/utils/cn'

const TEAM_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899']

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
    <section className="space-y-10">
      <div className="border-l-2 border-accent-cyan pl-8 py-2">
        <h2 className="text-4xl md:text-5xl font-syne font-black text-white uppercase tracking-tighter leading-none">
          Equipe
        </h2>
        <p className="label-muted mt-2">
          Performance & Distribuição de Talentos
        </p>
      </div>

      {/* Barber Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {barbers.map((barber) => (
          <div key={barber.id} className="premium-card p-10 group">
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white font-bold text-2xl uppercase shrink-0 group-hover:border-accent-cyan/30 transition-colors">
                {barber.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold font-syne text-white tracking-tight leading-none mb-2">{barber.name}</h3>
                <div className="flex items-center gap-2">
                  <Star size={16} weight="fill" className="text-accent-cyan" />
                  <span className="text-base font-bold font-mono text-white leading-none">{barber.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="label-muted">Atendimentos</p>
                <p className="text-3xl font-bold text-white font-mono">{barber.appointments}</p>
              </div>
              <div className="space-y-2">
                <p className="label-muted">Receita</p>
                <p className="text-3xl font-bold text-accent-cyan font-mono tracking-tighter">
                  <span className="text-xs align-top mr-1">R$</span>
                  {barber.revenue.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="space-y-2">
                <p className="label-muted">Taxa de Conclusão</p>
                <p className="text-base font-bold text-white font-mono">{barber.completionRate}%</p>
              </div>
              <div className="space-y-2">
                <p className="label-muted">Cancelamentos</p>
                <p className="text-base font-bold text-red-400 font-mono">{barber.cancellations}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Comparison */}
        <div className="premium-card p-10">
          <span className="label-muted mb-12 block">Comparativo de Receita</span>
          <div className="h-[300px]">
            <ClientOnly fallback={<div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#666', fontFamily: 'DM Mono' }} />
                  <YAxis stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#666', fontFamily: 'DM Mono' }} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>

        {/* Weekly Evolution */}
        <div className="premium-card p-10">
          <span className="label-muted mb-12 block">Evolução de Atendimentos</span>
          <div className="h-[300px]">
            <ClientOnly fallback={<div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyEvolution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="week" stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#666', fontFamily: 'DM Mono' }} />
                  <YAxis stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#666', fontFamily: 'DM Mono' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}
                  />
                  {barbers.map((b, i) => (
                    <Line 
                      key={b.id}
                      type="monotone" 
                      dataKey={b.name} 
                      stroke={TEAM_COLORS[i % TEAM_COLORS.length]} 
                      strokeWidth={3} 
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>
      </div>

      <div className="premium-card p-10">
        <span className="label-muted mb-12 block">Distribuição de Serviços</span>
        <div className="h-[400px]">
          <ClientOnly fallback={<div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceDistribution}>
                <CartesianGrid strokeDasharray="0" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="barberName" stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#666', fontFamily: 'DM Mono' }} />
                <YAxis stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#666', fontFamily: 'DM Mono' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}
                />
                {(() => {
                  const serviceNames = new Set<string>()
                  serviceDistribution.forEach(d => {
                    Object.keys(d).filter(k => k !== 'barberName').forEach(k => serviceNames.add(k))
                  })
                  const svcColors = ['#00e5ff', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
                  return Array.from(serviceNames).map((name, i) => (
                    <Bar key={name} dataKey={name} stackId="a" fill={svcColors[i % svcColors.length]} radius={0} />
                  ))
                })()}
              </BarChart>
            </ResponsiveContainer>
          </ClientOnly>
        </div>
      </div>
    </section>
  )
}
