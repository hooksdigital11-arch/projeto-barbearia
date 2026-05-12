'use client'

import dynamic from 'next/dynamic'
import { Users, Gift, Trophy, ChartBar } from '@phosphor-icons/react'
import type { LoyaltyConfig, ClientLoyalty, LoyaltyStats } from '../types'

const LoyaltyConfigPanel = dynamic(() => import('./loyalty-config-panel').then(m => m.LoyaltyConfigPanel), { ssr: false })
const LoyaltyClientsTable = dynamic(() => import('./loyalty-clients-table').then(m => m.LoyaltyClientsTable), { ssr: false })

interface LoyaltyPageAdminProps {
  config: LoyaltyConfig
  clients: ClientLoyalty[]
  stats: LoyaltyStats
}

export function LoyaltyPageAdmin({ config, clients, stats }: LoyaltyPageAdminProps) {
  return (
    <div className="animate-premium-in py-8 space-y-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-[32px] font-medium text-text-primary tracking-[-0.02em] uppercase">
          FIDELIDADE<span className="text-accent-main">.</span>
        </h1>
        <p className="text-[11px] text-[#333] leading-[1.5] max-w-[480px] font-medium uppercase tracking-wide">
          Gestão estratégica de retenção. Configure regras de fidelização para transformar clientes em defensores leais da sua marca.
        </p>
      </div>

      {/* Config Panel */}
      <LoyaltyConfigPanel config={config} />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { label: 'CLIENTES NO PROGRAMA', value: stats.totalClients, icon: Users, desc: 'Total de participações' },
          { label: 'PRONTOS P/ RESGATAR', value: stats.readyToRedeem, icon: Gift, desc: 'Meta atingida' },
          { label: 'RESGATES DO MÊS', value: stats.monthRedeems, icon: Trophy, desc: 'Benefícios concedidos' },
          { label: 'PROGRESSO MÉDIO', value: `${stats.avgProgress}/${stats.goal}`, icon: ChartBar, desc: 'Média de engajamento' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px] px-[18px] flex flex-col justify-between h-[110px]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-medium text-[#383838] tracking-[0.12em] uppercase">{kpi.label}</span>
              <kpi.icon size={14} weight="regular" className="text-accent-main opacity-35" />
            </div>
            <div className="space-y-1">
              <div className="text-[24px] text-text-primary font-medium leading-none">
                {kpi.value}
              </div>
              <p className="text-[8px] text-[#2a2a2a] tracking-[0.07em] font-medium uppercase">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Clients Table */}
      <LoyaltyClientsTable clients={clients} config={config} />
    </div>
  )
}
