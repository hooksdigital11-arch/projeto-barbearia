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
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageTitle 
          title="Gestão de Usuários" 
          subtitle="Cadastre e gerencie barbeiros e administradores da sua unidade" 
        />
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
