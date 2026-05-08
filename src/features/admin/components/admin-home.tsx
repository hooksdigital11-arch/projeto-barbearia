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
    <div className="space-y-16 animate-in fade-in duration-1000">
      {/* Header com Design Assimétrico */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-3 h-12 bg-accent-cyan rounded-full shadow-[0_0_30px_rgba(0,229,255,0.4)]" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-syne text-white tracking-tighter leading-none uppercase">
            Comando<span className="text-accent-cyan">.</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg font-medium max-w-xl ml-7 border-l border-white/10 pl-6">
          {greeting}, {firstName}. Bem-vindo ao centro de operações da sua barbearia. Gerencie cada detalhe com precisão.
        </p>
      </div>

      {/* Module Grid with Staggered Entrance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {modules.map((mod, index) => (
          <Link
            key={mod.href}
            href={mod.href}
            style={{ animationDelay: `${index * 50}ms` }}
            className={cn(
              "group relative flex flex-col justify-between p-10 rounded-[3rem] border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl",
              "hover:bg-white/[0.05] hover:border-white/[0.1] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]",
              "transition-all duration-700 active:scale-[0.98] outline-none animate-in fade-in slide-in-from-bottom-6",
              "focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
            )}
          >
            {/* Dynamic Glow on hover */}
            <div
              className="absolute inset-0 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${mod.accentColor}15 0%, transparent 80%)`,
              }}
            />

            <div className="relative z-10 space-y-8">
              {/* Icon Container with Glass Effect */}
              <div
                className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:shadow-2xl relative overflow-hidden"
                style={{
                  backgroundColor: `${mod.accentColor}15`,
                  border: `1px solid ${mod.accentColor}30`,
                }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `linear-gradient(135deg, ${mod.accentColor}20, transparent)` }}
                />
                <mod.icon
                  size={36}
                  weight="duotone"
                  style={{ color: mod.accentColor }}
                  className="transition-all duration-700 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                />
              </div>

              {/* Text Section */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold font-syne text-white tracking-tight group-hover:text-accent-cyan transition-colors duration-500">
                  {mod.label}
                </h3>
                <p className="text-sm text-text-secondary font-medium leading-relaxed tracking-tight group-hover:text-white/60 transition-colors duration-500">
                  {mod.description}
                </p>
              </div>
            </div>

            {/* Premium Action Indicator */}
            <div className="relative z-10 flex justify-end mt-10">
              <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center bg-white/[0.03] border border-white/[0.05] text-text-secondary group-hover:bg-white group-hover:text-black group-hover:shadow-2xl transition-all duration-700">
                <ArrowRight
                  size={20}
                  weight="bold"
                  className="transition-transform duration-700 group-hover:translate-x-1"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
