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
  Bar
} from 'recharts'
import { KPICard } from '@/components/shared/kpi-card'
import type { ClientReport } from '../types'
import { Users, UserPlus, ArrowsClockwise, Heart } from '@phosphor-icons/react/dist/ssr'

interface ClientsSectionProps {
  data: ClientReport
}

export function ClientsSection({ data }: ClientsSectionProps) {
  const { kpis, newClientsChart, frequencyDistribution, birthdays, topClients } = data

  return (
    <section className="space-y-6 pt-12 border-t border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-accent-cyan rounded-full" />
        <h2 className="text-xl font-syne font-bold text-white uppercase tracking-tight">Clientes</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Ativos"
          value={kpis.totalActive}
          icon={<Users size={24} weight="duotone" />}
          trend={kpis.totalActiveChange}
        />
        <KPICard
          title="Novos Clientes"
          value={kpis.newClients}
          icon={<UserPlus size={24} weight="duotone" />}
          trend={kpis.newClientsChange}
        />
        <KPICard
          title="Recorrentes"
          value={kpis.recurringClients}
          icon={<ArrowsClockwise size={24} weight="duotone" />}
          trend={kpis.recurringClientsChange}
        />
        <KPICard
          title="Taxa de Retenção"
          value={`${kpis.retentionRate.toFixed(1)}%`}
          icon={<Heart size={24} weight="duotone" />}
          trend={kpis.retentionRateChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Novos Clientes por Dia */}
        <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Novos Clientes</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={newClientsChart}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#00e5ff" fillOpacity={1} fill="url(#colorNew)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Frequência */}
        <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Fidelização</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="range" stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#00e5ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Clientes Table */}
      <div className="bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Top 10 Clientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-text-secondary uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4 text-center">Visitas</th>
                <th className="px-6 py-4 text-right">Total Gasto</th>
                <th className="px-6 py-4 text-right">Fidelidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topClients.map((client) => (
                <tr key={client.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-cyan/10 flex items-center justify-center text-accent-cyan font-bold text-sm uppercase shrink-0">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{client.name}</p>
                        <p className="text-xs text-text-secondary">Última: {client.lastVisit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-white">{client.visits}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-accent-cyan">
                    R$ {client.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan text-xs font-bold">
                      <Heart size={12} weight="duotone" />
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
