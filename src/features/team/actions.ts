'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import { updateBarberSchema } from './schemas'

export async function updateBarber(barberId: string, formData: FormData) {
  const user = await requireUser()

  // Barbeiro só pode editar o próprio perfil
  if (user.role !== 'admin' && user.id !== barberId) {
    return { error: 'Sem permissão para editar esse perfil' }
  }

  const rawData: Record<string, unknown> = {
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    specialty: formData.get('specialty'),
    avatar_url: formData.get('avatar_url'),
  }

  // Apenas admin pode mudar status
  if (user.role === 'admin') {
    rawData.status = formData.get('status')
  }

  const parsed = updateBarberSchema.safeParse(rawData)

  if (!parsed.success) {
    return { error: 'Dados inválidos', issues: parsed.error.flatten() }
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update(parsed.data)
    .eq('id', barberId)
    .eq('organization_id', user.organization_id)

  if (error) {
    console.error('[UPDATE_BARBER]', error.message)
    return { error: 'Erro ao atualizar barbeiro' }
  }

  revalidatePath('/admin/team')
  revalidatePath('/barber/team')
  return { success: true }
}
