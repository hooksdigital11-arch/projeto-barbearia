'use client'

import { cn } from '@/lib/utils/cn'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Gear, 
  Clock, 
  Scissors, 
  Bell, 
  ShareNetwork, 
  CloudArrowDown, 
  UserCircle, 
  Warning 
} from '@phosphor-icons/react'

const sections = [
  { label: 'Geral', href: '/admin/settings/general', icon: Gear },
  { label: 'Horários', href: '/admin/settings/hours', icon: Clock },
  { label: 'Serviços', href: '/admin/settings/services', icon: Scissors },
  { label: 'Notificações', href: '/admin/settings/notifications', icon: Bell },
  { label: 'Integrações', href: '/admin/settings/integrations', icon: ShareNetwork },
  { label: 'Backup', href: '/admin/settings/backup', icon: CloudArrowDown },
  { label: 'Perfil', href: '/admin/settings/profile', icon: UserCircle },
  { label: 'Zona de Perigo', href: '/admin/settings/danger', icon: Warning, danger: true },
]

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      {/* Header com Design Assimétrico */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-12 bg-accent-cyan rounded-full shadow-[0_0_30px_rgba(0,229,255,0.4)]" />
            <h1 className="text-5xl md:text-7xl font-black font-syne text-white tracking-tighter leading-none uppercase">
              Ajustes<span className="text-accent-cyan">.</span>
            </h1>
          </div>
          <p className="text-text-secondary text-lg font-medium max-w-xl ml-7 border-l border-white/10 pl-6">
            Configurações globais da unidade. Personalize horários, serviços, notificações e segurança do seu negócio.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 min-h-[600px]">
        {/* Sidebar Navigation Pro Max */}
        <aside className="w-full lg:w-72 flex flex-col gap-2 sticky top-8">
          {sections.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.15em] transition-all duration-500 group relative overflow-hidden",
                  isActive 
                    ? "bg-white text-black shadow-[0_15px_30px_rgba(255,255,255,0.1)]" 
                    : "text-muted-foreground hover:text-white hover:bg-white/[0.03] border border-transparent hover:border-white/5",
                  item.danger && !isActive && "hover:text-red-400 hover:bg-red-500/5",
                  item.danger && isActive && "bg-red-500 text-white shadow-[0_15px_30px_rgba(239,68,68,0.2)]"
                )}
              >
                <item.icon 
                  size={20} 
                  weight={isActive ? "fill" : "duotone"} 
                  className={cn(
                    "transition-all duration-500 group-hover:scale-110",
                    isActive ? (item.danger ? "text-white" : "text-black") : "text-muted-foreground group-hover:text-white",
                  )}
                />
                {item.label}
                {isActive && !item.danger && (
                  <div className="absolute right-4 w-1.5 h-1.5 bg-accent-cyan rounded-full shadow-[0_0_10px_rgba(0,229,255,1)]" />
                )}
              </Link>
            )
          })}
        </aside>

        {/* Main Content Area Pro Max */}
        <main className="flex-1 max-w-4xl animate-in fade-in slide-in-from-right-10 duration-1000">
          <div className="glass-card p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.01] pointer-events-none">
              <Gear size={200} weight="duotone" />
            </div>
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
