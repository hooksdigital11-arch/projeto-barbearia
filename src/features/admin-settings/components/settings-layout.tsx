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
    <div className="flex flex-col md:flex-row gap-8 min-h-[600px]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex flex-col gap-1 sticky top-8">
        {sections.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all group",
                isActive 
                  ? "bg-accent-cyan/10 text-accent-cyan shadow-[inset_0_0_0_1px_rgba(0,229,255,0.2)]" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5",
                item.danger && !isActive && "hover:text-red-400 hover:bg-red-500/5",
                item.danger && isActive && "bg-red-500/10 text-red-400 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)]"
              )}
            >
              <item.icon 
                size={20} 
                weight={isActive ? "fill" : "duotone"} 
                className={cn(
                  "transition-colors",
                  isActive ? "text-accent-cyan" : "group-hover:text-white",
                  item.danger && "text-red-400"
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-[2rem] p-8 shadow-2xl">
          {children}
        </div>
      </main>
    </div>
  )
}
