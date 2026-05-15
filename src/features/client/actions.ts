'use server'

import { revalidatePath } from 'next/cache'
import { requireClient } from '@/lib/auth/require-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { updateClientProfileSchema } from './schemas'

export async function updateClientProfile(formData: FormData) {
  const user = await requireClient()

  const parsed = updateClientProfileSchema.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos', issues: parsed.error.flatten() }
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .eq('organization_id', user.organization_id)

  if (error) {
    return { error: 'Erro ao salvar perfil' }
  }

  revalidatePath('/client/profile')
  return { success: true }
}
