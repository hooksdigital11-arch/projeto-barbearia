'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'

/**
 * EXEMPLO DE SERVER ACTION COM INVALIDAÇÃO DE CACHE
 * 
 * Esta função demonstra como finalizar um agendamento no banco de dados e 
 * limpar o cache (revalidatePath) das rotas do Next.js para que as novas Views/RPCs
 * sejam reprocessadas com os dados novos.
 */
export async function finalizarAgendamento(appointmentId: string) {
  const user = await requireUser()
  if (user.role !== 'admin' && user.role !== 'barber') return { error: 'Sem permissão' }
  if (!appointmentId || !/^[0-9a-f-]{36}$/i.test(appointmentId)) return { error: 'ID inválido' }
  const supabase = await createClient()

  // 1. Atualizar o banco de dados
  const { error } = await (supabase as any)
    .from('appointments')
    .update({ 
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', appointmentId)
    .eq('organization_id', user.organization_id)

  if (error) {
    return { error: 'Falha ao finalizar o agendamento', details: error.message }
  }

  // 2. Invalidação de Cache (Crucial para atualização das RPCs)
  // Como as nossas queries de Analytics usam o cache() do React e o Next.js
  // faz cache da rota, usar revalidatePath garante que a página fará um refetch
  // limpo chamando o `getDashboardStats()` novamente no servidor.
  revalidatePath('/admin')
  revalidatePath('/admin/reports')
  revalidatePath('/barber')

  return { success: true }
}
