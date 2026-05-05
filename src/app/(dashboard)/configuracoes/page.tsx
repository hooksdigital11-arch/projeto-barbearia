import { requireUser } from '@/lib/auth/require-auth'
import { redirect } from 'next/navigation'

/**
 * Rota de redirecionamento para Configurações.
 * Direciona o usuário para a página de configurações apropriada baseada na sua role.
 */
export default async function ConfiguracoesPage() {
  const profile = await requireUser()

  if (profile.role === 'admin') {
    redirect('/admin/settings')
  }

  // Barbeiros e Clientes por enquanto não possuem uma página de configurações dedicada
  // Se tivessem, redirecionaríamos para /barber/settings ou /client/settings
  redirect('/')
}
