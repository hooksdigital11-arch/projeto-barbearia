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
      {/* Section Header com Design Industrial */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <div className="w-1.5 h-8 bg-accent-cyan rounded-full shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
          <div className="w-1.5 h-1.5 bg-accent-cyan/40 rounded-full mt-2" />
        </div>
        <div>
          <h2 className="text-3xl font-syne font-black text-white uppercase tracking-tighter leading-none">
            Métricas Financeiras
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1">
            Performance & Fluxo de Caixa
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card Principal de Faturamento (Asymmetric & Bold) */}
        <div className="lg:col-span-5 relative group">
          <div className="absolute inset-0 bg-accent-cyan/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative h-full p-10 rounded-[3rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan border border-accent-cyan/20">
                  <CurrencyCircleDollar size={24} weight="duotone" />
                </div>
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 border",
                  kpis.totalRevenueChange >= 0 
                    ? "bg-green-500/10 text-green-400 border-green-500/20" 
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                )}>
                  {kpis.totalRevenueChange >= 0 ? <ArrowUpRight size={14} weight="bold" /> : <ArrowDownRight size={14} weight="bold" />}
                  {Math.abs(kpis.totalRevenueChange).toFixed(1)}%
                </div>
              </div>
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Faturamento Consolidado</h3>
              <p className="text-6xl md:text-7xl font-bold text-white tracking-tighter tabular-nums font-syne">
                <span className="text-2xl font-black text-accent-cyan align-top mr-1">R$</span>
                {kpis.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4 border-t border-white/5 pt-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Serviços</p>
                <p className="text-xl font-bold text-white tabular-nums">
                  R$ {kpis.serviceRevenue.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Produtos</p>
                <p className="text-xl font-bold text-white tabular-nums">
                  R$ {kpis.productRevenue.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-KPIs com Design Utilitário Refinado */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Ticket Médio', value: `R$ ${kpis.averageTicket.toFixed(2)}`, trend: kpis.averageTicketChange, icon: Ticket, color: '#3b82f6' },
            { title: 'Comandas', value: kpis.totalComandas, trend: kpis.totalComandasChange, icon: Receipt, color: '#00e5ff' },
            { title: 'Descontos', value: `R$ ${kpis.totalDiscounts.toFixed(2)}`, trend: kpis.totalDiscountsChange, icon: Tag, color: '#ff007f' },
            { title: 'Fidelidade', value: '124 Resgates', trend: 12, icon: Star, color: '#eab308' }
          ].map((item, idx) => (
            <div key={idx} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all duration-500 group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                <item.icon size={80} weight="duotone" />
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors">
                    <item.icon size={20} weight="duotone" style={{ color: item.color }} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black",
                    (item.trend ?? 0) >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {item.trend && item.trend >= 0 ? '+' : ''}{item.trend?.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{item.title}</h4>
                  <p className="text-3xl font-bold text-white tracking-tight tabular-nums">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos com Custom Shaders/Gradients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/5 rounded-full blur-3xl" />
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Faturamento Diário</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_8px_#00e5ff]" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Atual</span>
            </div>
          </div>
          <div className="h-[350px]">
            <ClientOnly>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00e5ff" stopOpacity={1} />
                      <stop offset="100%" stopColor="#00e5ff" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#666' }} dy={10} />
                  <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#666' }} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255, 255, 255, 0.03)', radius: 8 }}
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', padding: '16px' }}
                    itemStyle={{ color: '#00e5ff', fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#666', fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}
                  />
                  <Bar dataKey="revenue" fill="url(#barGradient)" radius={[8, 8, 0, 0]} maxBarSize={40} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>

        <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl flex flex-col group">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-10">Canais de Receita</h3>
          <div className="flex-1 flex items-center relative">
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total</p>
                <p className="text-3xl font-black text-white tabular-nums">100%</p>
              </div>
            </div>
            <ClientOnly>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    innerRadius={90}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                    nameKey="method"
                    stroke="none"
                    animationDuration={1500}
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell key={index} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} className="outline-none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '16px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {paymentMethods.map((pm, idx) => (
              <div key={pm.method} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[idx % PAYMENT_COLORS.length] }} />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{pm.method}</span>
                <span className="text-xs font-bold text-white ml-auto font-mono">{pm.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ranking com Design Magazine/Editorial */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 relative overflow-hidden">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-10">Ranking de Produtos</h3>
          <div className="space-y-8">
            {topProducts.slice(0, 5).map((prod, i) => (
              <div key={prod.name} className="relative group">
                <div className="flex justify-between items-end mb-3">
                  <div className="flex items-end gap-4">
                    <span className="text-4xl font-black text-white/5 font-syne group-hover:text-accent-cyan/20 transition-colors">0{i + 1}</span>
                    <div className="pb-1">
                      <p className="text-lg font-bold text-white tracking-tight">{prod.name}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{prod.category}</p>
                    </div>
                  </div>
                  <div className="text-right pb-1">
                    <p className="text-xl font-bold text-accent-cyan font-mono tracking-tighter">R$ {prod.totalRevenue.toLocaleString()}</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{prod.quantity} unidades</p>
                  </div>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent-cyan shadow-[0_0_10px_#00e5ff]" 
                    style={{ width: `${(prod.quantity / maxProductQty) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 p-10 rounded-[3rem] bg-accent-cyan text-black relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Tag size={120} weight="fill" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-60">Insight Estratégico</h3>
            <p className="text-3xl font-bold font-syne tracking-tighter leading-tight">
              Seu faturamento em <span className="underline decoration-4 underline-offset-4">produtos</span> cresceu 24% este mês.
            </p>
          </div>
          <button className="mt-10 w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black/90 transition-all active:scale-[0.98]">
            Ver Detalhes do Estoque
          </button>
        </div>
      </div>
    </section>
  )
}
