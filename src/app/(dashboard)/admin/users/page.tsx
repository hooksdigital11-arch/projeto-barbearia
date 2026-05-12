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
    <div className="space-y-24">
      <div className="space-y-1">
        <h1 className="text-[32px] font-medium tracking-[-0.02em] text-text-primary">
          USUÁRIOS<span className="text-accent-main">.</span>
        </h1>
        <p className="text-[11px] text-[#333] leading-[1.5] uppercase tracking-wide">
          Gestão de acessos e permissões. Controle sua equipe de barbeiros e administradores com total transparência e segurança.
        </p>
      </div>

      <Suspense fallback={
        <div className="h-[60vh] flex flex-col items-center justify-center gap-8">
          <div className="w-1.5 h-12 bg-accent-cyan animate-pulse" />
          <p className="text-[12px] font-black uppercase tracking-[0.5em] text-text-primary/40 animate-pulse">
            Carregando Equipe
          </p>
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
