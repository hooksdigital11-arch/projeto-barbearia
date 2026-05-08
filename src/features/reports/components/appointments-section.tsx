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
import { cn } from '@/lib/utils/cn'

interface AppointmentsSectionProps {
  data: AppointmentReport
}

export function AppointmentsSection({ data }: AppointmentsSectionProps) {
  const { kpis, statusDistribution, dayOfWeekDistribution, peakHours, barberDistribution } = data

  return (
    <section className="space-y-10 pt-12 border-t border-white/5">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <div className="w-1.5 h-8 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
          <div className="w-1.5 h-1.5 bg-purple-500/40 rounded-full mt-2" />
        </div>
        <div>
          <h2 className="text-3xl font-syne font-black text-white uppercase tracking-tighter leading-none">
            Fluxo de Agenda
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1">
            Demanda & Conversão
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total', value: kpis.total, trend: kpis.totalChange, icon: CalendarCheck, color: '#8b5cf6' },
          { title: 'Concluídos', value: kpis.completed, trend: kpis.completedChange, icon: CheckCircle, color: '#10b981' },
          { title: 'Cancelados', value: kpis.cancelled, trend: kpis.cancelledChange, icon: CalendarX, color: '#ef4444', inverted: true },
          { title: 'No-show', value: kpis.noShow, trend: kpis.noShowChange, icon: UserMinus, color: '#f59e0b', inverted: true },
          { title: 'Conversão', value: `${kpis.completionRate.toFixed(0)}%`, trend: kpis.completionRateChange, icon: CheckCircle, color: '#3b82f6' }
        ].map((item, idx) => (
          <div key={idx} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <item.icon size={20} weight="duotone" style={{ color: item.color }} />
                <span className={cn(
                  "text-[10px] font-black",
                  (item.trend ?? 0) >= 0 
                    ? (item.inverted ? "text-red-400" : "text-green-400") 
                    : (item.inverted ? "text-green-400" : "text-red-400")
                )}>
                  {item.trend && item.trend >= 0 ? '+' : ''}{item.trend?.toFixed(1)}%
                </span>
              </div>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em] mb-1">{item.title}</h4>
              <p className="text-2xl font-bold text-white tabular-nums tracking-tighter">{item.value}</p>
            </div>
            <div className="absolute -bottom-2 -right-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <item.icon size={64} weight="duotone" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl group">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-10">Status de Atendimento</h3>
          <div className="h-[300px] flex items-center relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Agenda</p>
                <p className="text-2xl font-black text-white tabular-nums">100%</p>
              </div>
            </div>
            <ClientOnly>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                    stroke="none"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} className="outline-none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>

        {/* Peak Hours com Area Chart */}
        <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-10">Horários de Pico</h3>
          <div className="h-[300px]">
            <ClientOnly>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={peakHours}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="hour" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#666' }} />
                  <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#666' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8b5cf6" 
                    strokeWidth={4} 
                    dot={false}
                    activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>
      </div>
    </section>
  )
}
