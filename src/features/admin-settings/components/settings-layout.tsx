'use client'

import { useRef } from 'react'
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
  const navRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = navRef.current
    if (!el) return
    const startX = e.pageX - el.offsetLeft
    const scrollLeft = el.scrollLeft

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.pageX - el.offsetLeft
      const walk = (x - startX) * 1.5
      el.scrollLeft = scrollLeft - walk
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="space-y-24">
      <PageTitle 
        title="Ajustes" 
        subtitle="Configurações globais da unidade. Personalize horários, serviços, notificações e segurança do seu negócio." 
      />

      <div className="flex flex-col lg:flex-row gap-12 min-h-[600px]">
        {/* Sidebar Navigation: Floating & Pill-Style */}
        <aside 
          ref={navRef}
          onMouseDown={handleMouseDown}
          className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 sticky top-8 shrink-0 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-none cursor-grab active:cursor-grabbing select-none"
        >
          {sections.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.06em] transition-all rounded-[10px] relative group shrink-0",
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
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[60%] rounded-full lg:block hidden"
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
