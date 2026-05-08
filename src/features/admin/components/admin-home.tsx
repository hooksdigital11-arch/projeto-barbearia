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
} from '@phosphor-icons/react/dist/ssr'

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
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="space-y-32 py-20 animate-premium-in">
      {/* Editorial Header - Balanced with precision */}
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="label-muted opacity-40">{greeting}, {firstName}</p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black font-syne text-white tracking-tighter leading-none uppercase">
            Comando<span className="text-accent-cyan">.</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-4xl">
          Gerencie cada operação com precisão espacial. Sua barbearia, sob controle absoluto.
        </p>
      </div>

      {/* Module Grid - Clean edges, no negative margins */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 overflow-hidden">
        {modules.map((mod, index) => (
          <Link
            key={mod.href}
            href={mod.href}
            className={cn(
              "group relative flex flex-col justify-between p-12 bg-black",
              "hover:bg-[#0a0a0a] transition-all duration-500 active:scale-[0.99] outline-none"
            )}
          >
            <div className="space-y-12">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 flex items-center justify-center text-accent-cyan opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                  <mod.icon size={32} weight="duotone" />
                </div>
                <ArrowRight 
                  size={24} 
                  weight="bold" 
                  className="text-white opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" 
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold font-syne text-white tracking-tight uppercase">
                  {mod.label}
                </h3>
                <p className="text-sm text-text-secondary font-medium tracking-tight">
                  {mod.description}
                </p>
              </div>
            </div>
            
            <div className="mt-12 h-[2px] w-0 bg-accent-cyan group-hover:w-12 transition-all duration-700" />
          </Link>
        ))}
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 py-20 border-t border-white/5">
        {[
          { label: 'Faturamento Hoje', value: 'R$ 4.280', unit: ',00' },
          { label: 'Taxa de Ocupação', value: '94', unit: '%' },
          { label: 'Novos Clientes', value: '12', unit: '' },
        ].map((kpi, idx) => (
          <div key={idx} className="space-y-2">
            <p className="label-muted">{kpi.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold font-mono text-white tracking-tighter">{kpi.value}</span>
              <span className="text-xl font-mono text-text-secondary">{kpi.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
