import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth/require-auth'

/**
 * /agendamentos → role-based redirect
 */
export default async function AgendamentosRedirect() {
  const user = await requireUser()

  if (user.role === 'admin') redirect('/admin/appointments')
  if (user.role === 'barber') redirect('/barber/appointments')
  redirect('/client')
}
