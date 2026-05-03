import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth/require-auth'

/**
 * Dashboard root page.
 * Authenticates the user and redirects them to the appropriate dashboard
 * based on their role (admin, barber, or client).
 */
export default async function DashboardPage() {
  const profile = await requireUser()

  // Redirect based on role
  if (profile.role === 'admin') {
    redirect('/admin')
  }

  if (profile.role === 'barber') {
    redirect('/barber')
  }

  // Default to client dashboard
  redirect('/client')
}
