import Link from "next/link"
import Image from "next/image"
import { DashboardNav } from "./dashboard-nav"
import { MobileSidebar } from "./mobile-sidebar"
import { requireUser } from "@/lib/auth/require-auth"
import { getOrganization } from "@/features/organization/queries"
import { LogoutButton } from "@/components/shared/logout-button"
import { RealtimeListener } from "@/components/shared/realtime-listener"
import { ThemeProvider } from "@/components/shared/theme-provider"

const navItems = [
  { label: "Home", href: "/", iconName: "SquaresFour" as const },
  { label: "Agendamentos", href: "/agendamentos", iconName: "Calendar" as const },
  { label: "Serviços", href: "/servicos", iconName: "Scissors" as const },
  { label: "Clientes", href: "/clientes", iconName: "Users" as const },
  { label: "Comanda", href: "/comanda", iconName: "Receipt" as const },
  { label: "Fila", href: "/fila", iconName: "Queue" as const },
  { label: "Fidelidade", href: "/fidelidade", iconName: "Star" as const },
  { label: "Equipe", href: "/equipe", iconName: "UserCircle" as const },
  { label: "Estoque", href: "/estoque", iconName: "Package" as const },
  { label: "Mensageria", href: "/mensageria", iconName: "ChatTeardropText" as const },
  { label: "Relatórios", href: "/relatorios", iconName: "ChartPieSlice" as const },
  { label: "Usuários", href: "/admin/users", iconName: "Users" as const },
  { label: "Configurações", href: "/configuracoes", iconName: "Gear" as const },
  { label: "Perfil", href: "/client/profile", iconName: "UserCircle" as const },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireUser()
  const organization = await getOrganization(profile.organization_id)
  const orgName = organization?.name || "BarberSaaS"
  const orgLogo = organization?.logo_url

  const homeHref = profile.role === 'admin' ? '/admin' : profile.role === 'barber' ? '/barber' : '/client'

  const filteredNavItems = navItems
    .filter((item) => {
      if (profile.role === 'admin') return item.label !== 'Perfil'
      if (profile.role === 'barber') return ['Home', 'Agendamentos', 'Serviços', 'Clientes', 'Comanda', 'Fila', 'Fidelidade', 'Mensageria', 'Relatórios'].includes(item.label)
      if (profile.role === 'client') return ['Home', 'Agendamentos', 'Serviços', 'Fila', 'Fidelidade', 'Perfil'].includes(item.label)
      return false
    })
    .map((item) => {
      let href = item.href
      if (item.label === 'Configurações' && profile.role === 'admin') href = '/admin/settings/general'
      else if (item.label === 'Home') href = homeHref
      else if (item.label === 'Agendamentos') href = profile.role === 'admin' ? '/admin/appointments' : profile.role === 'barber' ? '/barber/appointments' : '/client/appointments'
      else if (item.label === 'Serviços') href = profile.role === 'admin' ? '/admin/services' : profile.role === 'barber' ? '/barber/services' : '/client/services'
      else if (item.label === 'Estoque') href = profile.role === 'admin' ? '/admin/inventory' : '/barber/inventory'
      else if (item.label === 'Equipe') href = profile.role === 'admin' ? '/admin/team' : '/barber/team'
      else if (item.label === 'Clientes') href = profile.role === 'admin' ? '/admin/clients' : '/barber/clients'
      else if (item.label === 'Comanda') href = profile.role === 'admin' ? '/admin/comanda' : '/barber/comanda'
      else if (item.label === 'Fila') href = profile.role === 'admin' ? '/admin/waiting-list' : profile.role === 'barber' ? '/barber/waiting-list' : '/client/waiting-list'
      else if (item.label === 'Fidelidade') href = profile.role === 'admin' ? '/admin/loyalty' : profile.role === 'barber' ? '/barber/loyalty' : '/client/loyalty'
      else if (item.label === 'Mensageria') href = profile.role === 'admin' ? '/admin/messaging' : profile.role === 'barber' ? '/barber/messaging' : '/client/messaging'
      else if (item.label === 'Relatórios') href = profile.role === 'barber' ? '/barber/reports' : '/admin/reports'
      else if (item.label === 'Usuários') href = '/admin/users'

      return { ...item, href }
    })

  return (
    <div className="flex min-h-screen bg-bg-black relative overflow-hidden selection:bg-accent-main/30">
      <ThemeProvider />
      <RealtimeListener organizationId={profile.organization_id} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[200px] flex-col fixed inset-y-0 z-50 bg-bg-sidebar border-r-[0.5px] border-border-main">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-8">
            <Link
              href={homeHref}
              className="flex flex-col gap-3 hover:opacity-80 transition-all"
            >
              <div className="w-10 h-10 rounded-minimal overflow-hidden flex items-center justify-center bg-white/[0.02] border-[0.5px] border-border-main">
                {orgLogo ? (
                  <Image src={orgLogo} alt={orgName} width={40} height={40} className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-accent-main" />
                )}
              </div>
              <div className="flex flex-col">
                {profile.role === 'barber' ? (
                  <>
                    <span className="text-[12px] font-medium tracking-[0.1em] text-[#fff] uppercase leading-tight truncate">
                      {profile.full_name}
                    </span>
                    <span className="text-[9px] tracking-[0.12em] uppercase text-[#2e2e2e] mt-0.5">
                      PRECISION SYSTEMS
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-syne font-medium text-lg tracking-[-0.02em] text-text-primary truncate leading-tight uppercase">
                      {orgName}
                    </span>
                    <span className="text-[9px] tracking-[0.12em] uppercase text-text-secondary mt-1">
                      Precision
                    </span>
                  </>
                )}
              </div>
            </Link>
          </div>

          <DashboardNav items={filteredNavItems} />

          {/* Sidebar Footer */}
          <div className="mt-auto border-t-[0.5px] border-border-main p-[16px] px-[18px]">
            {profile.role === 'barber' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-[28px] h-[28px] rounded-[7px] bg-[#1a1a1a] flex items-center justify-center text-[#bbb] font-medium text-[11px] uppercase shrink-0">
                    {profile.full_name?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate text-[#bbb] leading-none uppercase">{profile.full_name}</p>
                    <p className="text-[9px] truncate text-[#333] mt-1 uppercase tracking-[0.06em]">BARBER</p>
                  </div>
                </div>
                <LogoutButton />
              </div>
            ) : profile.role === 'client' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-[28px] h-[28px] rounded-[7px] bg-[#1a1a1a] flex items-center justify-center text-[#bbb] font-medium text-[11px] uppercase shrink-0">
                    {profile.full_name?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate text-[#bbb] leading-none uppercase">{profile.full_name}</p>
                    <p className="text-[9px] truncate text-[#333] mt-1 uppercase tracking-[0.06em]">CLIENT</p>
                  </div>
                </div>
                <LogoutButton />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-[28px] h-[28px] rounded-[7px] bg-[#1a1a1a] flex items-center justify-center text-text-secondary font-medium text-[11px] uppercase shrink-0">
                    {profile.full_name?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate text-text-secondary leading-none uppercase tracking-tight">{profile.full_name}</p>
                    <p className="text-[9px] truncate text-[#333] mt-1 uppercase tracking-[0.06em]">{profile.role}</p>
                  </div>
                </div>
                <LogoutButton />
              </>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 overflow-x-hidden md:ml-[200px] flex flex-col relative z-10 min-h-screen bg-bg-black">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b-[0.5px] border-border-main flex items-center justify-between px-4 bg-bg-sidebar sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-minimal overflow-hidden flex items-center justify-center bg-white/[0.02] border-[0.5px] border-border-main">
              {orgLogo ? (
                <Image src={orgLogo} alt={orgName} width={32} height={32} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-accent-main" />
              )}
            </div>
            <span className="font-syne font-medium truncate max-w-[150px] text-text-primary text-sm uppercase tracking-tight">{orgName}</span>
          </div>
          <MobileSidebar
            items={filteredNavItems}
            orgName={orgName}
            orgLogo={orgLogo}
            userInitial={profile.full_name?.[0] || 'U'}
            userName={profile.full_name || ''}
            userRole={profile.role}
            homeHref={homeHref}
          />
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
