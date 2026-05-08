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
      <PageTitle 
        title="Usuários" 
        subtitle="Gestão de acessos e permissões. Controle sua equipe de barbeiros e administradores com total transparência e segurança." 
      />

      <Suspense fallback={
        <div className="h-[60vh] flex flex-col items-center justify-center gap-8">
          <div className="w-1.5 h-12 bg-accent-cyan animate-pulse" />
          <p className="text-[12px] font-black uppercase tracking-[0.5em] text-white/40 animate-pulse">
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
