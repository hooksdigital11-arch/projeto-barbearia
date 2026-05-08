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
  Gear,
  Scissors 
} from "@phosphor-icons/react/dist/ssr"

const navItems = [
  { label: "Home", href: "/", icon: SquaresFour },
  { label: "Agendamentos", href: "/agendamentos", icon: Calendar },
  { label: "Serviços", href: "/servicos", icon: Scissors },
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
  { label: "Perfil", href: "/client/profile", icon: UserCircle },
]

import { requireUser } from "@/lib/auth/require-auth"
import { getOrganization } from "@/features/organization/queries"
import { LogoutButton } from "@/components/shared/logout-button"
import { RealtimeListener } from "@/components/shared/realtime-listener"

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
    <div className="flex min-h-screen bg-black relative overflow-hidden">
      {/* Realtime Updates */}
      <RealtimeListener organizationId={profile.organization_id} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50 bg-black border-r border-white/[0.05]">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-12">
            <Link 
              href={profile.role === 'admin' ? '/admin' : profile.role === 'barber' ? '/barber' : '/client'} 
              className="flex flex-col gap-4 hover:opacity-80 transition-all active:scale-95"
            >
              <div className="w-12 h-12 rounded-[12px] overflow-hidden flex items-center justify-center bg-white/[0.03] border border-white/5">
                {orgLogo ? (
                  <Image src={orgLogo} alt={orgName} width={48} height={48} className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-accent-cyan" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-syne font-bold text-xl tracking-tight text-white truncate leading-tight uppercase">{orgName}</span>
                <span className="label-muted mt-1 opacity-50 text-[10px] tracking-[0.2em] uppercase">Precision Systems</span>
              </div>
            </Link>
          </div>
          
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide py-2">
            {navItems
              .filter((item) => {
                if (profile.role === 'admin') return item.label !== 'Perfil'
                if (profile.role === 'barber') return ['Home', 'Agendamentos', 'Serviços', 'Clientes', 'Comanda', 'Fila', 'Fidelidade', 'Equipe', 'Estoque', 'Mensageria'].includes(item.label)
                if (profile.role === 'client') return ['Home', 'Agendamentos', 'Serviços', 'Fila', 'Fidelidade', 'Perfil'].includes(item.label)
                return false
              })
              .map((item) => {
                let href = item.href
                if (item.label === 'Configurações' && profile.role === 'admin') href = '/admin/settings/general'
                else if (item.label === 'Home') href = profile.role === 'admin' ? '/admin' : profile.role === 'barber' ? '/barber' : '/client'
                else if (item.label === 'Agendamentos') href = profile.role === 'admin' ? '/admin/appointments' : profile.role === 'barber' ? '/barber/appointments' : '/client/appointments'
                else if (item.label === 'Serviços') href = profile.role === 'admin' ? '/admin/services' : profile.role === 'barber' ? '/barber/services' : '/client/services'
                else if (item.label === 'Estoque') href = profile.role === 'admin' ? '/admin/inventory' : '/barber/inventory'
                else if (item.label === 'Equipe') href = profile.role === 'admin' ? '/admin/team' : '/barber/team'
                else if (item.label === 'Clientes') href = profile.role === 'admin' ? '/admin/clients' : '/barber/clients'
                else if (item.label === 'Fila') href = profile.role === 'admin' ? '/admin/waiting-list' : profile.role === 'barber' ? '/barber/waiting-list' : '/client/waiting-list'
                else if (item.label === 'Fidelidade') href = profile.role === 'admin' ? '/admin/loyalty' : profile.role === 'barber' ? '/barber/loyalty' : '/client/loyalty'
                else if (item.label === 'Mensageria') href = profile.role === 'admin' ? '/admin/messaging' : '/barber/messaging'
                else if (item.label === 'Relatórios') href = '/admin/reports'
                else if (item.label === 'Usuários') href = '/admin/users'

                const isActive = false

                return (
                  <Link
                    key={item.href}
                    href={href}
                    className={cn(
                      "flex items-center gap-4 px-12 py-4 text-sm font-bold transition-all group relative",
                      "text-text-secondary hover:text-white hover:bg-white/[0.02]",
                      isActive && "text-white bg-white/[0.03]"
                    )}
                  >
                    <item.icon size={20} weight="bold" className={cn("transition-all", isActive ? "text-accent-cyan" : "group-hover:text-accent-cyan")} />
                    <span className="uppercase tracking-widest text-[11px]">{item.label}</span>
                    
                    {/* Active State Indicator: 2px left border */}
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-[2px] bg-accent-cyan transition-opacity",
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-30"
                    )} />
                  </Link>
                )
              })}
          </nav>

          <div className="p-12 mt-auto border-t border-white/5 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                {profile.full_name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-white leading-tight uppercase tracking-tight">{profile.full_name}</p>
                <p className="label-muted truncate opacity-40 mt-1">{profile.role}</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-72 flex flex-col relative z-10 min-h-screen bg-black">
        {/* Mobile Header */}
        <header className="md:hidden h-20 border-b border-white/5 flex items-center justify-between px-6 bg-black sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 border border-white/10">
              {orgLogo ? (
                <Image src={orgLogo} alt={orgName} width={32} height={32} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-accent-cyan" />
              )}
            </div>
            <span className="font-syne font-bold truncate max-w-[150px] text-white text-md uppercase tracking-tight">{orgName}</span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center text-accent-cyan">
             <SquaresFour size={24} weight="bold" />
          </button>
        </header>
        
        <main className="flex-1 p-8 md:p-16 lg:p-24 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

