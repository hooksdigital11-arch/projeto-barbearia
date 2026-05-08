'use client'

import dynamic from 'next/dynamic'
import { UsersThree, Gift, Stamp, ChartBar } from '@phosphor-icons/react'
import { PageTitle } from '@/components/shared/page-title'
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
    <div className="space-y-16 animate-premium-in">
      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        <PageTitle 
          title="Fidelidade" 
          subtitle="Gestão estratégica de retenção. Configure regras de fidelização para transformar clientes em defensores leais da sua marca." 
          className="mb-0" 
        />
      </div>

      {/* Config Panel */}
      <LoyaltyConfigPanel config={config} />

      {/* KPI Section - Precision Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 overflow-hidden">
        {[
          { label: 'Clientes no Programa', value: stats.totalClients, icon: UsersThree, color: '#00e5ff', desc: 'Total de participações' },
          { label: 'Prontos p/ Resgatar', value: stats.readyToRedeem, icon: Gift, color: '#10b981', desc: 'Meta atingida' },
          { label: 'Resgates do Mês', value: stats.monthRedeems, icon: Stamp, color: '#8b5cf6', desc: 'Benefícios concedidos' },
          { label: 'Progresso Médio', value: `${stats.avgProgress}/${stats.goal}`, icon: ChartBar, color: '#3b82f6', desc: 'Média de engajamento' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-10 bg-black flex flex-col justify-between h-48 group">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
                {kpi.label}
              </p>
              <kpi.icon size={20} weight="bold" style={{ color: kpi.color }} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-5xl font-bold font-mono text-white tracking-tighter group-hover:text-accent-cyan transition-colors">
                {kpi.value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest opacity-30 group-hover:opacity-60 transition-opacity">
                {kpi.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Clients Table */}
      <LoyaltyClientsTable clients={clients} config={config} />
    </div>
  )
}
