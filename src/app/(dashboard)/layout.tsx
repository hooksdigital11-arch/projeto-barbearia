import { cn } from "@/lib/utils/cn"
import Link from "next/link"
import Image from "next/image"
import { 
  SquaresFour, 
  Calendar, 
  Users, 
  Receipt, 
  Queue, 
  Star, 
  UserCircle, 
  Package, 
  ChatTeardropText, 
  ChartPieSlice, 
  Gear 
} from "@phosphor-icons/react/dist/ssr"

const navItems = [
  { label: "Dashboard", href: "/", icon: SquaresFour },
  { label: "Agendamentos", href: "/agendamentos", icon: Calendar },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Comanda", href: "/comanda", icon: Receipt },
  { label: "Fila", href: "/fila", icon: Queue },
  { label: "Fidelidade", href: "/fidelidade", icon: Star },
  { label: "Equipe", href: "/equipe", icon: UserCircle },
  { label: "Estoque", href: "/estoque", icon: Package },
  { label: "Mensageria", href: "/mensageria", icon: ChatTeardropText },
  { label: "Relatórios", href: "/relatorios", icon: ChartPieSlice },
  { label: "Usuários", href: "/admin/users", icon: Users },
  { label: "Configurações", href: "/configuracoes", icon: Gear },
]

import { requireUser } from "@/lib/auth/require-auth"
import { getOrganization } from "@/features/organization/queries"
import { LogoutButton } from "@/components/shared/logout-button"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireUser()
  const organization = await getOrganization(profile.organization_id)
  const orgName = organization?.name || "BarberSaaS"
  const orgLogo = organization?.logo_url

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 border-r border-white/5 bg-bg-secondary/50 backdrop-blur-xl">
        <div className="p-6">
          <Link 
            href={profile.role === 'admin' ? '/admin' : profile.role === 'barber' ? '/barber' : '/client'} 
            className="flex items-center gap-3 px-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 border border-white/10">
              {orgLogo ? (
                <Image src={orgLogo} alt={orgName} width={32} height={32} className="object-cover" />
              ) : (
                <div className="w-full h-full accent-gradient" />
              )}
            </div>
            <span className="font-syne font-bold text-xl tracking-tight text-white truncate">{orgName}</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => {
              if (profile.role === 'admin') return true
              if (profile.role === 'barber') {
                return ['Dashboard', 'Agendamentos', 'Fila', 'Fidelidade', 'Equipe', 'Estoque'].includes(item.label)
              }
              if (profile.role === 'client') {
                return ['Dashboard', 'Agendamentos', 'Fidelidade'].includes(item.label)
              }
              return false
            })
            .map((item) => {
              let href = item.href
              
              if (item.label === 'Configurações' && profile.role === 'admin') {
                href = '/admin/settings/general'
              } else if (item.label === 'Dashboard') {
                href = profile.role === 'admin' ? '/admin' : profile.role === 'barber' ? '/barber' : '/client'
              } else if (item.label === 'Estoque') {
                href = profile.role === 'admin' ? '/admin/inventory' : '/barber/inventory'
              } else if (item.label === 'Equipe') {
                href = profile.role === 'admin' ? '/admin/team' : '/barber/team'
              }

              return (
                <Link
                  key={item.href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group",
                    "text-text-secondary hover:text-text-primary hover:bg-white/5"
                  )}
                >
                  <item.icon size={20} weight="duotone" className="transition-colors group-hover:text-accent-cyan" />
                  {item.label}
                </Link>
              )
            })}
        </nav>

        <div className="p-4 mt-auto space-y-3">
          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-blue flex items-center justify-center font-bold text-black">
              {profile.full_name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-white">{profile.full_name}</p>
              <p className="text-xs text-text-secondary truncate capitalize">{profile.role}</p>
            </div>
          </div>
          <div className="border-t border-white/5 pt-2">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col">
        {/* Mobile Header (placeholder) */}
        <header className="md:hidden h-16 border-b border-white/5 flex items-center justify-between px-6 bg-bg-secondary/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center bg-white/5 border border-white/10">
              {orgLogo ? (
                <Image src={orgLogo} alt={orgName} width={24} height={24} className="object-cover" />
              ) : (
                <div className="w-full h-full accent-gradient" />
              )}
            </div>
            <span className="font-syne font-bold truncate max-w-[150px] text-white">{orgName}</span>
          </div>
          <button className="p-2 text-text-secondary">
             <SquaresFour size={24} weight="duotone" />
          </button>
        </header>
        
        {children}
      </div>
    </div>
  )
}
