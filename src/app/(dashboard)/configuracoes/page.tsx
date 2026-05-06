import { requireUser } from '@/lib/auth/require-auth'
import { RoleRedirect } from '@/components/shared/role-redirect'

/**
 * Rota de redirecionamento para Configurações.
 * Direciona o usuário para a página de configurações apropriada baseada na sua role.
 */
export default async function ConfiguracoesPage() {
  const profile = await requireUser()

  return (
    <RoleRedirect 
      role={profile.role} 
      adminPath="/admin/settings/general" 
      barberPath="/" 
      clientPath="/" 
    />
  )
}

