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
import { CurrencyCircleDollar, Ticket, Receipt, Tag, Package, ArrowUpRight, ArrowDownRight, MagnifyingGlass, WarningCircle, Star } from '@phosphor-icons/react'
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
    <section className="space-y-10">
      {/* Section Header: Editorial & Pinned */}
      <div className="border-l-2 border-accent-cyan pl-8 py-2">
        <h2 className="text-4xl md:text-5xl font-syne font-black text-white uppercase tracking-tighter leading-none">
          Receita
        </h2>
        <p className="label-muted mt-2">
          Fluxo de Caixa & Performance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card Principal de Faturamento (Asymmetric & Bold) */}
        <div className="lg:col-span-5 premium-card p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-12">
              <span className="label-muted">Faturamento Consolidado</span>
              <div className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black border font-mono tracking-tighter",
                kpis.totalRevenueChange >= 0 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              )}>
                {kpis.totalRevenueChange >= 0 ? '+' : ''}{kpis.totalRevenueChange.toFixed(1)}%
              </div>
            </div>
            <p className="text-7xl md:text-8xl font-bold text-white tracking-tighter tabular-nums font-syne leading-none">
              <span className="text-2xl font-black text-accent-cyan align-top mr-2">R$</span>
              {kpis.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 border-t border-white/[0.06] pt-8">
            <div className="space-y-2">
              <p className="label-muted">Serviços</p>
              <p className="text-2xl font-bold text-white tabular-nums font-mono">
                R$ {kpis.serviceRevenue.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="space-y-2">
              <p className="label-muted">Produtos</p>
              <p className="text-2xl font-bold text-white tabular-nums font-mono">
                R$ {kpis.productRevenue.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Ticket Médio', value: `R$ ${kpis.averageTicket.toFixed(2)}`, trend: kpis.averageTicketChange },
            { title: 'Comandas', value: kpis.totalComandas, trend: kpis.totalComandasChange },
            { title: 'Descontos', value: `R$ ${kpis.totalDiscounts.toFixed(2)}`, trend: kpis.totalDiscountsChange },
            { title: 'Loyalty', value: '124 Resgates', trend: 12 }
          ].map((item, idx) => (
            <KPICard 
              key={idx}
              title={item.title}
              value={item.value}
              trend={item.trend}
              isPositive={(item.trend ?? 0) >= 0}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="premium-card p-10">
          <div className="flex items-center justify-between mb-12">
            <span className="label-muted">Performance Diária</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-cyan" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Atual</span>
            </div>
          </div>
          <div className="h-[350px]">
            <ClientOnly>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="0" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#666', fontFamily: 'DM Mono' }} dy={10} />
                  <YAxis stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#666', fontFamily: 'DM Mono' }} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                    contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}
                    itemStyle={{ color: '#00e5ff', fontSize: '12px', fontWeight: 'bold', fontFamily: 'DM Mono' }}
                    labelStyle={{ color: '#666', fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="revenue" fill="#00e5ff" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>

        <div className="premium-card p-10 flex flex-col">
          <span className="label-muted mb-12 block">Mix de Vendas</span>
          <div className="flex-1 flex items-center relative">
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-2">Volume</p>
                <p className="text-5xl font-bold text-white tabular-nums font-syne leading-none">100%</p>
              </div>
            </div>
            <ClientOnly>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    innerRadius={110}
                    outerRadius={125}
                    paddingAngle={8}
                    dataKey="value"
                    nameKey="method"
                    stroke="none"
                    cornerRadius={40}
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell key={index} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} className="outline-none" />
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
          <div className="grid grid-cols-2 gap-4 mt-8">
            {paymentMethods.map((pm, idx) => (
              <div key={pm.method} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[idx % PAYMENT_COLORS.length] }} />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{pm.method}</span>
                <span className="text-sm font-bold text-white ml-auto font-mono">{pm.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ranking com Design Magazine/Editorial */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 premium-card p-10">
          <span className="label-muted mb-12 block">Ranking de Produtos</span>
          <div className="space-y-10">
            {topProducts.slice(0, 5).map((prod, i) => (
              <div key={prod.name} className="relative group">
                <div className="flex justify-between items-end mb-4">
                  <div className="flex items-end gap-6">
                    <span className="text-5xl font-black text-white/5 font-mono tracking-tighter leading-none">0{i + 1}</span>
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-white tracking-tight leading-none">{prod.name}</p>
                      <p className="label-muted">{prod.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-accent-cyan font-mono tracking-tighter">R$ {prod.totalRevenue.toLocaleString()}</p>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{prod.quantity} unidades</p>
                  </div>
                </div>
                <div className="h-px bg-white/[0.05] w-full" />
                <div 
                  className="h-1 bg-accent-cyan mt-[-1px] transition-all duration-1000" 
                  style={{ width: `${(prod.quantity / maxProductQty) * 100}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-accent-cyan p-12 rounded-premium flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/50 mb-6">Performance Insights</h3>
            <p className="text-4xl font-bold font-syne tracking-tighter leading-[1.1] text-black">
              Crescimento de <span className="bg-black text-accent-cyan px-2 py-1">24%</span> no faturamento de produtos.
            </p>
          </div>
          <button className="mt-12 w-full py-6 bg-black text-accent-cyan rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all active:scale-[0.98]">
            Análise de Inventário
          </button>
        </div>
      </div>
    </section>
  )
}
