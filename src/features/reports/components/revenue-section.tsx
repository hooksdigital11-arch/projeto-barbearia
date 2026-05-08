'use client'

import { useState } from 'react'
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
import type { RevenueReport } from '../types'
import { CurrencyCircleDollar, Ticket, Receipt, Tag, Package, ArrowUpRight, ArrowDownRight, MagnifyingGlass, WarningCircle } from '@phosphor-icons/react/dist/ssr'
import { ClientOnly } from '@/components/shared/client-only'
import { cn } from '@/lib/utils/cn'

interface RevenueSectionProps {
  data: RevenueReport
}

const PAYMENT_COLORS = ['#00e5ff', '#ff007f', '#7000ff', '#00ff9d']

export function RevenueSection({ data }: RevenueSectionProps) {
  const { kpis, chartData, paymentMethods, topServices, topProducts, barberPerformance, consumedStock } = data
  const [stockTab, setStockTab] = useState<'venda' | 'uso_interno'>('venda')

  const maxProductQty = Math.max(...topProducts.map(p => p.quantity), 1)

  const consumedStockFiltered = consumedStock.filter(s => s.type === stockTab)
  const totalConsumed = consumedStockFiltered.reduce((acc, s) => acc + s.qtdSaida, 0)

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-accent-cyan rounded-full" />
        <h2 className="text-xl font-syne font-bold text-white uppercase tracking-tight">Financeiro</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Faturamento Principal + Subcards */}
        <div className="lg:col-span-1 space-y-4 flex flex-col">
          <div className="bg-bg-card border border-white/5 rounded-2xl p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <CurrencyCircleDollar size={80} weight="duotone" />
            </div>
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">Faturamento Total</h3>
            <p className="text-4xl font-mono font-bold text-white">
              R$ {kpis.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className={cn("flex items-center text-sm font-bold", kpis.totalRevenueChange >= 0 ? "text-green-400" : "text-red-400")}>
                {kpis.totalRevenueChange >= 0 ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                {Math.abs(kpis.totalRevenueChange).toFixed(1)}%
              </span>
              <span className="text-xs text-text-secondary">vs período anterior</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-card border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Serviços</p>
              <p className="text-lg font-mono font-bold text-accent-cyan">
                R$ {kpis.serviceRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <span className={cn("text-[10px] font-bold flex items-center mt-1", kpis.serviceRevenueChange >= 0 ? "text-green-400" : "text-red-400")}>
                {kpis.serviceRevenueChange >= 0 ? '+' : ''}{kpis.serviceRevenueChange.toFixed(1)}%
              </span>
            </div>
            <div className="bg-bg-card border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Produtos</p>
              <p className="text-lg font-mono font-bold text-accent-cyan">
                R$ {kpis.productRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <span className={cn("text-[10px] font-bold flex items-center mt-1", kpis.productRevenueChange >= 0 ? "text-green-400" : "text-red-400")}>
                {kpis.productRevenueChange >= 0 ? '+' : ''}{kpis.productRevenueChange.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Outros KPIs originais */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 h-[180px]">
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
        {/* Top 5 Produtos Mais Vendidos */}
        <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl flex flex-col">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Ranking de Produtos Mais Vendidos</h3>
          
          {topProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-50 py-12">
              <MagnifyingGlass size={48} weight="duotone" className="text-text-secondary mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest text-text-secondary">Nenhuma venda registrada no período</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {topProducts.map((prod, i) => (
                <div key={prod.name} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-secondary">#{i + 1}</span>
                      <span className="text-sm font-bold text-white">{prod.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-text-secondary uppercase tracking-wider">
                        {prod.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-text-secondary">{prod.quantity} un.</span>
                      <span className="text-sm font-mono font-bold text-accent-cyan">
                        R$ {prod.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-cyan" 
                      style={{ width: `${(prod.quantity / maxProductQty) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estoque Consumido */}
        <div className="p-6 bg-bg-secondary/50 border border-white/5 rounded-2xl backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Estoque Consumido</h3>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest px-3 py-1 bg-white/5 rounded-lg border border-white/10">
              {totalConsumed} Itens
            </span>
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setStockTab('venda')}
              className={cn("flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors", stockTab === 'venda' ? "bg-accent-cyan text-black" : "text-text-secondary hover:text-white")}
            >
              Vendas
            </button>
            <button 
              onClick={() => setStockTab('uso_interno')}
              className={cn("flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors", stockTab === 'uso_interno' ? "bg-white/10 text-white border border-white/10" : "text-text-secondary hover:text-white")}
            >
              Uso Interno
            </button>
          </div>
          
          {consumedStockFiltered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-50 py-12">
              <Package size={48} weight="duotone" className="text-text-secondary mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest text-text-secondary">Nenhum consumo registrado</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {consumedStockFiltered.map(item => (
                <div key={item.inventoryId} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md border border-white/10 text-text-secondary uppercase tracking-wider">
                        {item.category}
                      </span>
                      {item.type === 'venda' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-md border border-accent-cyan/20 bg-accent-cyan/10 text-accent-cyan uppercase tracking-wider font-bold">
                          Venda
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-md border border-white/20 bg-white/10 text-white uppercase tracking-wider font-bold">
                          Uso Interno
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowDownRight size={16} className="text-red-400" />
                    <span className="text-lg font-bold text-white">{item.qtdSaida}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
