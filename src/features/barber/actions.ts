'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireBarber } from '@/lib/auth/require-auth'

export async function toggleBarberShift(newStatus: 'active' | 'inactive') {
  try {
    const user = await requireBarber()

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', user.id)
      .eq('organization_id', user.organization_id)

    if (error) {
      console.error('Error updating barber shift:', error)
      return { error: 'Erro ao alterar o status do turno.' }
    }

    revalidatePath('/barber')
    revalidatePath('/admin/users')
    revalidatePath('/admin/team')
    
    return { success: true }
  } catch (err) {
    console.error('Shift action error:', err)
    return { error: 'Erro inesperado ao atualizar o turno.' }
  }
}
