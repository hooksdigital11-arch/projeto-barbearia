import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth/require-auth'

/**
 * Redirects the user to the correct comanda page based on their role.
 * /comanda -> /admin/comanda OR /barber/comanda
 */
export default async function ComandaRedirectPage() {
  const profile = await requireUser()

  if (profile.role === 'admin') {
    redirect('/admin/comanda')
  }

  if (profile.role === 'barber') {
    redirect('/barber/comanda')
  }

  // Clients don't have a comanda page
  redirect('/client')
}
