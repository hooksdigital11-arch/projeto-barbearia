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
    description: 'Gerencie horários e compromissos da equipe',
    href: '/admin/appointments',
    icon: Calendar,
    accentColor: '#3b82f6',
    badge: null,
  },
  {
    label: 'Comanda Digital',
    description: 'Registre serviços e produtos por atendimento',
    href: '/comanda',
    icon: Receipt,
    accentColor: '#f59e0b',
    badge: null,
  },
  {
    label: 'Fila de Espera',
    description: 'Controle a fila de clientes em tempo real',
    href: '/fila',
    icon: Queue,
    accentColor: '#10b981',
    badge: null,
  },
  {
    label: 'Mensageria',
    description: 'Envie mensagens e notificações aos clientes',
    href: '/mensageria',
    icon: ChatTeardropText,
    accentColor: '#8b5cf6',
    badge: null,
  },
  {
    label: 'Clientes',
    description: 'Base de clientes, histórico e preferências',
    href: '/admin/clients',
    icon: Users,
    accentColor: '#06b6d4',
    badge: null,
  },
  {
    label: 'Fidelidade',
    description: 'Programa de selos e resgates de prêmios',
    href: '/fidelidade',
    icon: Star,
    accentColor: '#eab308',
    badge: null,
  },
  {
    label: 'Cupons',
    description: 'Crie e gerencie cupons de desconto',
    href: '/admin/loyalty',
    icon: Ticket,
    accentColor: '#ec4899',
    badge: null,
  },
  {
    label: 'Equipe',
    description: 'Performance, escala e perfis dos barbeiros',
    href: '/equipe',
    icon: UserCircle,
    accentColor: '#3b82f6',
    badge: null,
  },
  {
    label: 'Estoque',
    description: 'Controle de produtos e alertas de reposição',
    href: '/estoque',
    icon: Package,
    accentColor: '#f97316',
    badge: null,
  },
  {
    label: 'Relatórios',
    description: 'Análises financeiras e métricas de performance',
    href: '/admin/reports',
    icon: ChartPieSlice,
    accentColor: '#00e5ff',
    badge: null,
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
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-10 bg-accent-cyan rounded-full shadow-[0_0_20px_rgba(0,229,255,0.6)]" />
          <h1 className="text-4xl md:text-5xl font-black font-syne text-white tracking-tighter leading-none">
            {greeting}, {firstName}
          </h1>
        </div>
        <p className="text-text-secondary text-base md:text-lg max-w-xl">
          Selecione um módulo para começar a gerenciar sua barbearia.
        </p>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className={cn(
              "group relative flex flex-col justify-between p-7 rounded-[2rem] border border-white/[0.06] bg-white/[0.02]",
              "hover:bg-white/[0.06] hover:border-white/[0.12] hover:shadow-2xl",
              "transition-all duration-300 active:scale-[0.97] outline-none",
              "focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
            )}
          >
            {/* Glow on hover */}
            <div
              className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 30% 0%, ${mod.accentColor}08 0%, transparent 70%)`,
              }}
            />

            <div className="relative z-10 space-y-5">
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                style={{
                  backgroundColor: `${mod.accentColor}15`,
                  boxShadow: `0 0 0px ${mod.accentColor}00`,
                }}
              >
                <mod.icon
                  size={28}
                  weight="duotone"
                  style={{ color: mod.accentColor }}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Text */}
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold font-syne text-white tracking-tight group-hover:text-white transition-colors">
                  {mod.label}
                </h3>
                <p className="text-xs text-text-secondary font-mono leading-relaxed">
                  {mod.description}
                </p>
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="relative z-10 flex justify-end mt-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/[0.06] text-text-secondary group-hover:bg-accent-cyan group-hover:border-transparent group-hover:text-black transition-all duration-300">
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </div>
            </div>

            {/* Badge (optional, for future use like "3 alertas") */}
            {mod.badge && (
              <div className="absolute top-5 right-5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                {mod.badge}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
