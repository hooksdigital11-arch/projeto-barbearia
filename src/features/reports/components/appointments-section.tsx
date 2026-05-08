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
  Line,
  AreaChart,
  Area
} from 'recharts'
import { KPICard } from '@/components/shared/kpi-card'
import type { AppointmentReport } from '../types'
import { CalendarCheck, CalendarX, UserMinus, CheckCircle } from '@phosphor-icons/react/dist/ssr'
import { ClientOnly } from '@/components/shared/client-only'
import { cn } from '@/lib/utils/cn'

interface AppointmentsSectionProps {
  data: AppointmentReport
}

export function AppointmentsSection({ data }: AppointmentsSectionProps) {
  const { kpis, statusDistribution, dayOfWeekDistribution, peakHours, barberDistribution } = data

  return (
    <section className="space-y-10 pt-12 border-t border-white/5">
      <div className="border-l-2 border-accent-cyan pl-8 py-2">
        <h2 className="text-4xl md:text-5xl font-syne font-black text-white uppercase tracking-tighter leading-none">
          Agenda
        </h2>
        <p className="label-muted mt-2">
          Fluxo & Conversão de Clientes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { title: 'Total', value: kpis.total, trend: kpis.totalChange },
          { title: 'Concluídos', value: kpis.completed, trend: kpis.completedChange },
          { title: 'Cancelados', value: kpis.cancelled, trend: kpis.cancelledChange, inverted: true },
          { title: 'No-show', value: kpis.noShow, trend: kpis.noShowChange, inverted: true },
          { title: 'Conversão', value: `${kpis.completionRate.toFixed(0)}%`, trend: kpis.completionRateChange }
        ].map((item, idx) => (
          <KPICard 
            key={idx}
            title={item.title}
            value={item.value}
            trend={item.trend}
            isPositive={item.inverted ? (item.trend ?? 0) <= 0 : (item.trend ?? 0) >= 0}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="premium-card p-10">
          <span className="label-muted mb-12 block">Status de Atendimento</span>
          <div className="h-[350px] flex items-center relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-2">Mix</p>
                <p className="text-5xl font-bold text-white tabular-nums font-syne leading-none">100%</p>
              </div>
            </div>
            <ClientOnly>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    innerRadius={110}
                    outerRadius={125}
                    paddingAngle={8}
                    dataKey="count"
                    nameKey="status"
                    stroke="none"
                    cornerRadius={40}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} className="outline-none" />
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

        {/* Peak Hours */}
        <div className="premium-card p-10">
          <span className="label-muted mb-12 block">Horários de Pico</span>
          <div className="h-[350px]">
            <ClientOnly>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={peakHours} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" stroke="#ffffff03" vertical={false} />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#ffffff10" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#666', fontFamily: 'DM Mono' }}
                    interval={2}
                  />
                  <YAxis 
                    stroke="#ffffff10" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#666', fontFamily: 'DM Mono' }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ stroke: '#ffffff10', strokeWidth: 1 }}
                    contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}
                    itemStyle={{ color: '#00e5ff', fontSize: '12px', fontWeight: 'bold', fontFamily: 'DM Mono' }}
                    labelStyle={{ color: '#666', fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '2px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#00e5ff" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#peakGradient)"
                    activeDot={{ r: 6, fill: '#00e5ff', stroke: '#000', strokeWidth: 2 }}
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>
      </div>
    </section>
  )
}
