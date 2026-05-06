import { requireUser } from '@/lib/auth/require-auth'
import { RoleRedirect } from '@/components/shared/role-redirect'

/**
 * /agendamentos → role-based redirect
 */
export default async function AgendamentosRedirect() {
  const user = await requireUser()

  return (
    <RoleRedirect 
      role={user.role} 
      adminPath="/admin/appointments" 
      barberPath="/barber/appointments" 
      clientPath="/client" 
    />
  )
}

