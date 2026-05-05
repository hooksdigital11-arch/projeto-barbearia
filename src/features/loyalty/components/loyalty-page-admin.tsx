'use client'

import { UsersThree, Gift, Stamp, ChartBar } from '@phosphor-icons/react'
import { LoyaltyConfigPanel } from './loyalty-config-panel'
import { LoyaltyClientsTable } from './loyalty-clients-table'
import type { LoyaltyConfig, ClientLoyalty, LoyaltyStats } from '../types'

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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-syne text-white tracking-tight">Fidelidade</h1>
        <p className="text-muted-foreground mt-1 text-sm">Configure o programa e acompanhe os clientes.</p>
      </div>

      {/* Config Panel */}
      <LoyaltyConfigPanel config={config} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`${kpi.bgColor} border rounded-[2rem] p-6 transition-all hover:scale-[1.02]`}>
            <div className={`w-10 h-10 rounded-2xl bg-black/20 flex items-center justify-center ${kpi.color} mb-4`}>
              <kpi.icon size={22} weight="duotone" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-bold text-white mt-1 font-syne">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Clients Table */}
      <LoyaltyClientsTable clients={clients} config={config} />
    </div>
  )
}
