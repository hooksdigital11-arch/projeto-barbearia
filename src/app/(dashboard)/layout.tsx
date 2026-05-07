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
    <div className="flex min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Realtime Updates */}
      <RealtimeListener organizationId={profile.organization_id} />

      {/* Decorative background effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-cyan/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-accent-blue/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50 p-4">
        <div className="glass-card flex flex-col h-full overflow-hidden">
          <div className="p-8">
            <Link 
              href={profile.role === 'admin' ? '/admin' : profile.role === 'barber' ? '/barber' : '/client'} 
              className="flex items-center gap-4 hover:opacity-80 transition-all active:scale-95"
            >
              <div className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 shadow-lg">
                {orgLogo ? (
                  <Image src={orgLogo} alt={orgName} width={40} height={40} className="object-cover" />
                ) : (
                  <div className="w-full h-full accent-gradient" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-syne font-bold text-lg tracking-tight text-white truncate leading-tight">{orgName}</span>
                <span className="text-[10px] text-accent-cyan font-bold tracking-[0.2em] uppercase opacity-70">Barber Pro</span>
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

                return (
                  <Link
                    key={item.href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all group relative overflow-hidden",
                      "text-text-secondary hover:text-white hover:bg-white/5 active:scale-95"
                    )}
                  >
                    <item.icon size={22} weight="duotone" className="transition-all group-hover:text-accent-cyan group-hover:scale-110" />
                    {item.label}
                    {/* Hover indicator */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-accent-cyan rounded-r-full transition-all group-hover:h-8" />
                  </Link>
                )
              })}
          </nav>

          <div className="p-6 mt-auto">
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-4 flex items-center gap-4 transition-all hover:bg-white/5 group">
              <div className="w-11 h-11 rounded-2xl bg-accent-cyan flex items-center justify-center font-bold text-black shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                {profile.full_name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-white leading-tight">{profile.full_name}</p>
                <p className="text-[10px] text-text-secondary truncate uppercase tracking-widest font-bold opacity-60 mt-0.5">{profile.role}</p>
              </div>
            </div>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-[304px] flex flex-col relative z-10 min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden h-20 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 shadow-lg">
              {orgLogo ? (
                <Image src={orgLogo} alt={orgName} width={36} height={36} className="object-cover" />
              ) : (
                <div className="w-full h-full accent-gradient" />
              )}
            </div>
            <span className="font-syne font-bold truncate max-w-[150px] text-white text-lg tracking-tight">{orgName}</span>
          </div>
          <button className="tap-target glass rounded-2xl text-accent-cyan shadow-lg shadow-cyan-500/10">
             <SquaresFour size={24} weight="bold" />
          </button>
        </header>
        
        <main className="flex-1 p-6 md:p-10 lg:p-12">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

