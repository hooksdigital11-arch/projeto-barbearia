import { Suspense } from 'react'
import { getOrganizationUsers } from '@/features/admin-users/queries'
import { UsersList } from '@/features/admin-users/components/users-list'
import { PageTitle } from '@/components/shared/page-title'
import { requireAdmin } from '@/lib/auth/require-auth'
import { CircleNotch } from '@phosphor-icons/react/dist/ssr'

/**
 * Página de Gestão de Usuários (Administradores e Barbeiros).
 * Apenas acessível por usuários com role 'admin'.
 */
export default async function AdminUsersPage() {
  // Segurança: Garante que apenas admins acessem
  await requireAdmin()

  return (
    <div className="p-4 md:p-8 space-y-16 animate-in fade-in duration-1000">
      {/* Header com Design Assimétrico */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-12 bg-accent-cyan rounded-full shadow-[0_0_30px_rgba(0,229,255,0.4)]" />
            <h1 className="text-5xl md:text-7xl font-black font-syne text-white tracking-tighter leading-none uppercase">
              Usuários<span className="text-accent-cyan">.</span>
            </h1>
          </div>
          <p className="text-text-secondary text-lg font-medium max-w-xl ml-7 border-l border-white/10 pl-6">
            Gestão de acessos e permissões. Controle sua equipe de barbeiros e administradores com total transparência e segurança.
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-card rounded-2xl border border-white/5">
          <CircleNotch size={40} className="animate-spin text-accent-cyan" />
          <p className="text-muted-foreground animate-pulse">Carregando lista de usuários...</p>
        </div>
      }>
        <UsersContent />
      </Suspense>
    </div>
  )
}

async function UsersContent() {
  const users = await getOrganizationUsers()
  return <UsersList initialUsers={users} />
}
