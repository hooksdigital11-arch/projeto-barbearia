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
  Palette, 
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
  { label: 'Aparência', href: '/admin/settings/appearance', icon: Palette },
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
        {/* Sidebar Navigation: Floating & Pill-Style */}
        <aside className="w-full lg:w-64 flex flex-col gap-2 sticky top-8 shrink-0">
          {sections.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.06em] transition-all rounded-[10px] relative group",
                  isActive 
                    ? (item.danger 
                        ? "bg-[#1a0d0d] text-[#c04040]" 
                        : "bg-bg-surface text-text-primary") 
                    : "text-[#333] hover:text-text-nav hover:bg-white/[0.02]",
                )}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[60%] rounded-full"
                    style={{ background: item.danger ? '#c04040' : 'var(--accent, #00d4aa)' }}
                  />
                )}

                <item.icon 
                  size={18} 
                  weight={isActive ? "bold" : "regular"} 
                  className={cn(
                    "transition-colors",
                    isActive ? (item.danger ? "text-[#c04040]" : "text-text-primary") : "text-[#2a2a2a]"
                  )}
                />
                {item.label}
              </Link>
            )
          })}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl">
          <div className="premium-card p-4 sm:p-6 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
