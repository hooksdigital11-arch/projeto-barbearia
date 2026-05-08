'use client'

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from 'recharts'
import { KPICard } from '@/components/shared/kpi-card'
import type { LoyaltyReport } from '../types'
import { Star, Gift, Ticket, Users } from '@phosphor-icons/react/dist/ssr'
import { ClientOnly } from '@/components/shared/client-only'

interface LoyaltySectionProps {
  data: LoyaltyReport
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6']

export function LoyaltySection({ data }: LoyaltySectionProps) {
  const { kpis, redemptionsByMonth, stampsDistribution } = data

  return (
    <section className="space-y-10">
      <div className="border-l-2 border-accent-cyan pl-8 py-2">
        <h2 className="text-4xl md:text-5xl font-syne font-black text-white uppercase tracking-tighter leading-none">
          Fidelidade
        </h2>
        <p className="label-muted mt-2">
          Retenção & Programas de Recompensa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Membros Ativos"
          value={kpis.activeMembers}
          trend={kpis.activeMembersChange}
        />
        <KPICard
          title="Resgates Realizados"
          value={kpis.redemptions}
          trend={kpis.redemptionsChange}
        />
        <KPICard
          title="Selos Distribuídos"
          value={kpis.stampsDistributed}
          trend={kpis.stampsDistributedChange}
        />
        <KPICard
          title="Prontos p/ Resgate"
          value={kpis.readyToRedeem}
          trend={kpis.readyToRedeemChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribuição de Selos */}
        <div className="premium-card p-10 flex flex-col">
          <span className="label-muted mb-12 block">Engajamento dos Clientes</span>
          <div className="flex-1 flex items-center relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-2">Engajamento</p>
                <p className="text-5xl font-bold text-white tabular-nums font-syne leading-none">100%</p>
              </div>
            </div>
            <ClientOnly fallback={<div className="w-full h-full bg-white/5 rounded-full animate-pulse mx-auto aspect-square max-w-[200px]" />}>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={stampsDistribution}
                    innerRadius={110}
                    outerRadius={125}
                    paddingAngle={8}
                    dataKey="count"
                    nameKey="range"
                    stroke="none"
                    cornerRadius={40}
                  >
                    {stampsDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="outline-none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontFamily: 'DM Mono' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>

        {/* Resgates por Mês */}
        <div className="premium-card p-10">
          <span className="label-muted mb-12 block">Evolução de Resgates</span>
          <div className="h-[300px]">
            <ClientOnly fallback={<div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={redemptionsByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="month" stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#666', fontFamily: 'DM Mono' }} />
                  <YAxis stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#666', fontFamily: 'DM Mono' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="count" fill="#00e5ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>
      </div>
    </section>
  )
}
