import { requireUser } from '@/lib/auth/require-auth'
import { RoleRedirect } from '@/components/shared/role-redirect'

/**
 * Dashboard root page.
 * Authenticates the user and redirects them to the appropriate dashboard
 * based on their role (admin, barber, or client).
 */
export default async function DashboardPage() {
  const profile = await requireUser()

  return (
    <RoleRedirect 
      role={profile.role} 
      adminPath="/admin" 
      barberPath="/barber" 
      clientPath="/client" 
    />
  )
}

