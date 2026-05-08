'use client'

import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts'
import { KPICard } from '@/components/shared/kpi-card'
import type { RevenueReport } from '../types'
import { CurrencyCircleDollar, Ticket, Receipt, Tag } from '@phosphor-icons/react/dist/ssr'
import { ClientOnly } from '@/components/shared/client-only'

interface RevenueSectionProps {
  data: RevenueReport
}

const PAYMENT_COLORS = ['#00e5ff', '#ff007f', '#7000ff', '#00ff9d']

export function RevenueSection({ data }: RevenueSectionProps) {
  const { kpis, chartData, paymentMethods, topServices, topProducts, barberPerformance } = data

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-accent-cyan rounded-full" />
        <h2 className="text-xl font-syne font-bold text-white uppercase tracking-tight">Financeiro</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Receita Total"
          value={`R$ ${kpis.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<CurrencyCircleDollar size={24} weight="duotone" />}
          trend={kpis.totalRevenueChange}
          isPositive={kpis.totalRevenueChange >= 0}
        />
        <KPICard
          title="Ticket Médio"
          value={`R$ ${kpis.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<Ticket size={24} weight="duotone" />}
          trend={kpis.averageTicketChange}
          isPositive={kpis.averageTicketChange >= 0}
        />
        <KPICard
          title="Total de Comandas"
          value={kpis.totalComandas}
          icon={<Receipt size={24} weight="duotone" />}
          trend={kpis.totalComandasChange}
          isPositive={kpis.totalComandasChange >= 0}
        />
        <KPICard
          title="Descontos"
          value={`R$ ${kpis.totalDiscounts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<Tag size={24} weight="duotone" />}
          trend={kpis.totalDiscountsChange}
          isPositive={kpis.totalDiscountsChange <= 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita por Dia */}
        <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Receita por Dia</h3>
          <div className="h-[300px]">
            <ClientOnly fallback={<div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#a0a0a0" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#a0a0a0" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `R$ ${val}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#00e5ff', fontSize: '12px' }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#00e5ff" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={50}
                  />
                  {chartData[0]?.previousRevenue !== undefined && (
                    <Bar 
                      dataKey="previousRevenue" 
                      fill="#a0a0a0" 
                      fillOpacity={0.3}
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={50}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>

        {/* Forma de Pagamento */}
        <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Formas de Pagamento</h3>
          <div className="h-[300px] flex items-center">
            <ClientOnly fallback={<div className="w-full h-full bg-white/5 rounded-full animate-pulse mx-auto aspect-square max-w-[200px]" />}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="method"
                    stroke="#141414"
                    strokeWidth={2}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                      index,
                    }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          className="text-[10px] font-bold"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    labelLine={false}
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Serviços */}
        <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Top 5 Serviços</h3>
          <div className="h-[300px] flex items-center">
            <ClientOnly fallback={<div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topServices}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="quantity"
                    nameKey="name"
                    stroke="#141414"
                    strokeWidth={2}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {topServices.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Produtos */}
        <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Top 5 Produtos</h3>
          <div className="h-[300px] flex items-center">
            <ClientOnly fallback={<div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProducts}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="quantity"
                    nameKey="name"
                    stroke="#141414"
                    strokeWidth={2}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {topProducts.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PAYMENT_COLORS[(index + 2) % PAYMENT_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>

        {/* Tabela Barbeiros */}
        <div className="bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Receita por Barbeiro</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-3">Barbeiro</th>
                  <th className="px-6 py-3 text-center">Atend.</th>
                  <th className="px-6 py-3 text-right">Receita</th>
                  <th className="px-6 py-3 text-right">Tkt Médio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {barberPerformance.map((barber) => (
                  <tr key={barber.barberId} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3 text-sm font-bold text-white">{barber.name}</td>
                    <td className="px-6 py-3 text-center text-sm text-text-secondary">{barber.appointments}</td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-accent-cyan">R$ {barber.revenue.toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-3 text-right text-sm text-text-secondary">R$ {barber.averageTicket.toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
