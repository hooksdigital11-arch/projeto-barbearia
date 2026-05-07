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
  Legend,
  LineChart,
  Line
} from 'recharts'
import { KPICard } from '@/components/shared/kpi-card'
import type { AppointmentReport } from '../types'
import { CalendarCheck, CalendarX, UserMinus, CheckCircle } from '@phosphor-icons/react/dist/ssr'
import { ClientOnly } from '@/components/shared/client-only'

interface AppointmentsSectionProps {
  data: AppointmentReport
}

export function AppointmentsSection({ data }: AppointmentsSectionProps) {
  const { kpis, statusDistribution, dayOfWeekDistribution, peakHours, barberDistribution } = data

  return (
    <section className="space-y-6 pt-12 border-t border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-accent-cyan rounded-full" />
        <h2 className="text-xl font-syne font-bold text-white uppercase tracking-tight">Agendamentos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total"
          value={kpis.total}
          icon={<CalendarCheck size={24} weight="duotone" />}
          trend={kpis.totalChange}
        />
        <KPICard
          title="Concluídos"
          value={kpis.completed}
          icon={<CheckCircle size={24} weight="duotone" />}
          trend={kpis.completedChange}
        />
        <KPICard
          title="Cancelados"
          value={kpis.cancelled}
          icon={<CalendarX size={24} weight="duotone" />}
          trend={kpis.cancelledChange}
          isPositive={kpis.cancelledChange <= 0}
        />
        <KPICard
          title="No-show"
          value={kpis.noShow}
          icon={<UserMinus size={24} weight="duotone" />}
          trend={kpis.noShowChange}
          isPositive={kpis.noShowChange <= 0}
        />
        <KPICard
          title="Conclusão"
          value={`${kpis.completionRate.toFixed(1)}%`}
          icon={<CheckCircle size={24} weight="duotone" />}
          trend={kpis.completionRateChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Status dos Agendamentos</h3>
          <div className="h-[300px] flex items-center">
            <ClientOnly fallback={<div className="w-full h-full bg-white/5 rounded-full animate-pulse mx-auto aspect-square max-w-[200px]" />}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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

        {/* Day of Week */}
        <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Distribuição por Dia</h3>
          <div className="h-[300px]">
            <ClientOnly fallback={<div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="day" stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Horários de Pico</h3>
          <div className="h-[300px]">
            <ClientOnly fallback={<div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={peakHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="hour" stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8b5cf6" 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={{ r: 6, fill: '#0a0a0a', stroke: '#8b5cf6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>

        {/* Barber Distribution */}
        <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Agendamentos por Barbeiro</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barberDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="barberName" stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}
