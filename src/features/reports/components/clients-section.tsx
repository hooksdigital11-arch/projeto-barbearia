'use client'

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { KPICard } from '@/components/shared/kpi-card'
import type { ClientReport } from '../types'
import { Users, UserPlus, ArrowsClockwise, HeartStraight } from '@phosphor-icons/react/dist/ssr'
import { ClientOnly } from '@/components/shared/client-only'

const FREQ_COLORS = ['#10b981', '#06b6d4', '#6366f1', '#a855f7']

interface ClientsSectionProps {
  data: ClientReport
}

export function ClientsSection({ data }: ClientsSectionProps) {
  const { kpis, newClientsChart, frequencyDistribution, birthdays, topClients } = data

  return (
    <section className="space-y-10">
      <div className="border-l-2 border-accent-cyan pl-8 py-2">
        <h2 className="text-4xl md:text-5xl font-syne font-black text-white uppercase tracking-tighter leading-none">
          Clientes
        </h2>
        <p className="label-muted mt-2">
          Retenção & Crescimento de Base
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Ativos"
          value={kpis.totalActive}
          trend={kpis.totalActiveChange}
        />
        <KPICard
          title="Novos Clientes"
          value={kpis.newClients}
          trend={kpis.newClientsChange}
        />
        <KPICard
          title="Recorrentes"
          value={kpis.recurringClients}
          trend={kpis.recurringClientsChange}
        />
        <KPICard
          title="Taxa de Retenção"
          value={`${kpis.retentionRate.toFixed(1)}%`}
          trend={kpis.retentionRateChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Novos Clientes por Dia */}
        <div className="premium-card p-10">
          <span className="label-muted mb-12 block">Novos Clientes</span>
          <div className="h-[300px]">
            <ClientOnly fallback={<div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={newClientsChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#666', fontFamily: 'DM Mono' }} />
                  <YAxis stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#666', fontFamily: 'DM Mono' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#00e5ff" 
                    fill="#00e5ff10" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>

        {/* Frequência */}
        <div className="premium-card p-10 flex flex-col">
          <span className="label-muted mb-12 block">Frequência de Visitas</span>
          <div className="flex-1 flex items-center relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-2">Visitas</p>
                <p className="text-5xl font-bold text-white tabular-nums font-syne leading-none">100%</p>
              </div>
            </div>
            <ClientOnly fallback={<div className="w-full h-full bg-white/5 rounded-full animate-pulse mx-auto aspect-square max-w-[200px]" />}>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={frequencyDistribution}
                    innerRadius={110}
                    outerRadius={125}
                    paddingAngle={8}
                    dataKey="count"
                    nameKey="range"
                    stroke="none"
                    cornerRadius={40}
                  >
                    {frequencyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={FREQ_COLORS[index % FREQ_COLORS.length]} className="outline-none" />
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
      </div>

      {/* Top Clientes Table */}
      <div className="premium-card">
        <div className="px-10 py-8 border-b border-white/[0.06]">
          <span className="label-muted">Top 10 Clientes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-10 py-6 label-muted">Cliente</th>
                <th className="px-10 py-6 label-muted text-center">Visitas</th>
                <th className="px-10 py-6 label-muted text-right">Gasto Total</th>
                <th className="px-10 py-6 label-muted text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {topClients.map((client) => (
                <tr key={client.id} className="hover:bg-bg-hover transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white font-bold text-sm uppercase shrink-0 group-hover:border-accent-cyan/30 transition-colors">
                        {client.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-bold text-white tracking-tight">{client.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Última: {client.lastVisit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center text-base font-bold text-white font-mono">{client.visits}</td>
                  <td className="px-10 py-8 text-right text-base font-bold text-accent-cyan font-mono">
                    R$ {client.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-text-secondary text-[10px] font-black uppercase tracking-widest group-hover:border-accent-cyan/20 transition-colors">
                      {client.loyaltyPoints} carimbos
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
