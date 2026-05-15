'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { 
  Calendar, 
  Receipt, 
  Queue, 
  ChatTeardropText, 
  Users, 
  Star, 
  Ticket, 
  UserCircle, 
  Package, 
  ChartPieSlice,
  ArrowRight
} from '@phosphor-icons/react'

const modules = [
  {
    label: 'Agendamentos',
    description: 'Gestão de fluxo e horários',
    href: '/admin/appointments',
    icon: Calendar,
  },
  {
    label: 'Comanda Digital',
    description: 'Faturamento em tempo real',
    href: '/comanda',
    icon: Receipt,
  },
  {
    label: 'Fila de Espera',
    description: 'Monitoramento de presenças',
    href: '/admin/waiting-list',
    icon: Queue,
  },
  {
    label: 'Mensageria',
    description: 'Relacionamento automatizado',
    href: '/admin/messaging',
    icon: ChatTeardropText,
  },
  {
    label: 'Clientes',
    description: 'Base de dados e histórico',
    href: '/admin/clients',
    icon: Users,
  },
  {
    label: 'Fidelidade',
    description: 'Programa de recompensas',
    href: '/admin/loyalty',
    icon: Star,
  },
  {
    label: 'Performance',
    description: 'Escalabilidade da equipe',
    href: '/admin/team',
    icon: UserCircle,
  },
  {
    label: 'Estoque',
    description: 'Controle de ativos físicos',
    href: '/admin/inventory',
    icon: Package,
  },
  {
    label: 'Relatórios',
    description: 'Inteligência de mercado',
    href: '/admin/reports',
    icon: ChartPieSlice,
  },
]

interface AdminHomeProps {
  userName: string
}

export function AdminHome({ userName }: AdminHomeProps) {
  const firstName = userName?.split(' ')[0] || 'Admin'
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'BOM DIA' : hour < 18 ? 'BOA TARDE' : 'BOA NOITE'

  return (
    <div className="space-y-16 py-8">
      {/* Minimalist Header */}
      <div className="space-y-2">
        <p className="text-[10px] tracking-[0.12em] text-text-secondary uppercase font-medium">{greeting}, {firstName}</p>
        <h1 className="text-4xl font-medium font-syne text-text-primary tracking-[-0.02em] uppercase">
          Dashboard<span className="text-accent-main">.</span>
        </h1>
      </div>

      {/* KPI Section - Precision Data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
        {[
          { label: 'FATURAMENTO HOJE', value: '4.280', unit: 'R$' },
          { label: 'TAXA DE OCUPAÇÃO', value: '94', unit: '%' },
          { label: 'NOVOS CLIENTES', value: '12', unit: '' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-bg-surface border-[0.5px] border-border-main rounded-[10px] p-[20px] px-[22px] flex flex-col justify-between h-[120px]">
            <p className="text-[10px] tracking-[0.1em] text-text-secondary font-medium uppercase">{kpi.label}</p>
            <div className="flex items-baseline gap-1">
              {kpi.unit === 'R$' && <span className="text-[13px] text-text-nav font-medium">{kpi.unit}</span>}
              <span className="text-xl md:text-[28px] font-medium text-text-primary tracking-tight">
                {kpi.value}
              </span>
              {kpi.unit !== 'R$' && kpi.unit !== '' && <span className="text-[13px] text-text-nav font-medium">{kpi.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Module Grid - Exactly 3 columns */}
      <div className="space-y-6">
        <p className="text-[10px] tracking-[0.12em] text-text-secondary font-medium uppercase">Módulos do Sistema</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
          {modules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="group flex flex-col gap-4 p-6 premium-card premium-card-hover transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="text-accent-main">
                  <mod.icon size={18} weight="regular" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-[12px] font-medium text-text-primary tracking-tight">
                  {mod.label}
                </h3>
                <p className="text-[10px] text-text-muted font-medium tracking-tight">
                  {mod.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
