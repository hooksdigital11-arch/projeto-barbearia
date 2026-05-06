import { requireUser } from '@/lib/auth/require-auth'
import { RoleRedirect } from '@/components/shared/role-redirect'

/**
 * Redirects the user to the correct comanda page based on their role.
 * /comanda -> /admin/comanda OR /barber/comanda
 */
export default async function ComandaRedirectPage() {
  const profile = await requireUser()

  return (
    <RoleRedirect 
      role={profile.role} 
      adminPath="/admin/comanda" 
      barberPath="/barber/comanda" 
      clientPath="/client" 
    />
  )
}

