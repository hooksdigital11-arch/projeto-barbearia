'use client'

import dynamic from 'next/dynamic'
import { UsersThree, Gift, Stamp, ChartBar } from '@phosphor-icons/react'
import type { LoyaltyConfig, ClientLoyalty, LoyaltyStats } from '../types'

const LoyaltyConfigPanel = dynamic(() => import('./loyalty-config-panel').then(m => m.LoyaltyConfigPanel), { ssr: false })
const LoyaltyClientsTable = dynamic(() => import('./loyalty-clients-table').then(m => m.LoyaltyClientsTable), { ssr: false })

interface LoyaltyPageAdminProps {
  config: LoyaltyConfig
  clients: ClientLoyalty[]
  stats: LoyaltyStats
}

export function LoyaltyPageAdmin({ config, clients, stats }: LoyaltyPageAdminProps) {
  const unit = config.mode === 'stamps' ? 'carimbos' : 'pontos'

  const kpis = [
    {
      label: 'Clientes com Programa',
      value: stats.totalClients,
      icon: UsersThree,
      color: 'text-accent-cyan',
      bgColor: 'bg-accent-cyan/10 border-accent-cyan/20',
    },
    {
      label: 'Prontos p/ Resgatar',
      value: stats.readyToRedeem,
      icon: Gift,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20',
    },
    {
      label: 'Resgates Esse Mês',
      value: stats.monthRedeems,
      icon: Stamp,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Progresso Médio',
      value: `${stats.avgProgress}/${stats.goal}`,
      icon: ChartBar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
    },
  ]

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      {/* Header com Design Assimétrico */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-12 bg-accent-cyan rounded-full shadow-[0_0_30px_rgba(0,229,255,0.4)]" />
            <h1 className="text-5xl md:text-7xl font-black font-syne text-white tracking-tighter leading-none uppercase">
              Fidelidade<span className="text-accent-cyan">.</span>
            </h1>
          </div>
          <p className="text-text-secondary text-lg font-medium max-w-xl ml-7 border-l border-white/10 pl-6">
            Gestão estratégica de retenção. Configure regras de fidelização para transformar clientes em defensores leais da sua marca.
          </p>
        </div>
      </div>

      {/* Config Panel */}
      <LoyaltyConfigPanel config={config} />

      {/* KPI Cards com Design Pro Max */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Clientes no Programa', value: stats.totalClients, icon: UsersThree, color: '#00e5ff', desc: 'Total de participações' },
          { label: 'Prontos p/ Resgatar', value: stats.readyToRedeem, icon: Gift, color: '#10b981', desc: 'Meta atingida' },
          { label: 'Resgates do Mês', value: stats.monthRedeems, icon: Stamp, color: '#8b5cf6', desc: 'Benefícios concedidos' },
          { label: 'Progresso Médio', value: `${stats.avgProgress}/${stats.goal}`, icon: ChartBar, color: '#3b82f6', desc: 'Média de engajamento' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-white/[0.03] border border-white/10 group-hover:scale-110 transition-transform">
                <kpi.icon size={24} weight="duotone" style={{ color: kpi.color }} />
              </div>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{kpi.label}</h4>
              <p className="text-4xl font-bold text-white tabular-nums tracking-tighter">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest opacity-50">{kpi.desc}</p>
            </div>
            <div className="absolute -bottom-2 -right-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <kpi.icon size={80} weight="duotone" />
            </div>
          </div>
        ))}
      </div>

      {/* Clients Table */}
      <LoyaltyClientsTable clients={clients} config={config} />
    </div>
  )
}
