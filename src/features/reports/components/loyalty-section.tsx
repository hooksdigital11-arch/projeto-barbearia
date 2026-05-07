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
    <section className="space-y-6 pt-12 border-t border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-accent-cyan rounded-full" />
        <h2 className="text-xl font-syne font-bold text-white uppercase tracking-tight">Fidelidade</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Membros Ativos"
          value={kpis.activeMembers}
          icon={<Users size={24} weight="duotone" />}
          trend={kpis.activeMembersChange}
        />
        <KPICard
          title="Resgates Realizados"
          value={kpis.redemptions}
          icon={<Gift size={24} weight="duotone" />}
          trend={kpis.redemptionsChange}
        />
        <KPICard
          title="Selos Distribuídos"
          value={kpis.stampsDistributed}
          icon={<Star size={24} weight="duotone" />}
          trend={kpis.stampsDistributedChange}
        />
        <KPICard
          title="Prontos p/ Resgate"
          value={kpis.readyToRedeem}
          icon={<Ticket size={24} weight="duotone" />}
          trend={kpis.readyToRedeemChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Selos */}
        <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Engajamento dos Clientes</h3>
          <div className="h-[300px] flex items-center">
            <ClientOnly fallback={<div className="w-full h-full bg-white/5 rounded-full animate-pulse mx-auto aspect-square max-w-[200px]" />}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stampsDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="range"
                  >
                    {stampsDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>

        {/* Resgates por Mês */}
        <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Evolução de Resgates</h3>
          <div className="h-[300px]">
            <ClientOnly fallback={<div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={redemptionsByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="month" stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>
      </div>
    </section>
  )
}
