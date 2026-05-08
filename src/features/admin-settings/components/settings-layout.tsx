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
import { PageTitle } from '@/components/shared/page-title'

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
    <div className="space-y-24">
      <PageTitle 
        title="Ajustes" 
        subtitle="Configurações globais da unidade. Personalize horários, serviços, notificações e segurança do seu negócio." 
      />

      <div className="flex flex-col lg:flex-row gap-12 min-h-[600px]">
        {/* Sidebar Navigation: Minimalist & Border-Driven */}
        <aside className="w-full lg:w-72 flex flex-col gap-0 sticky top-8">
          {sections.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-5 px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-l-2",
                  isActive 
                    ? (item.danger 
                        ? "border-red-500 text-white bg-red-500/5" 
                        : "border-accent-cyan text-white bg-accent-cyan/5") 
                    : "border-transparent text-text-muted hover:text-white hover:bg-white/[0.02]",
                )}
              >
                <item.icon 
                  size={18} 
                  weight={isActive ? "bold" : "regular"} 
                  className={cn(isActive && !item.danger && "text-accent-cyan")}
                />
                {item.label}
              </Link>
            )
          })}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl">
          <div className="premium-card p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
