'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createServiceSchema } from './schemas'
import type { CreateServiceInput } from './schemas'

/**
 * Cria um novo serviço — somente Admin.
 */
export async function createService(input: CreateServiceInput) {
  try {
    const admin = await requireAdmin()
    const parsed = createServiceSchema.safeParse(input)

    if (!parsed.success) {
      return { error: 'Dados inválidos', issues: parsed.error.flatten() }
    }

    const { error } = await supabaseAdmin
      .from('services')
      .insert({
        name: parsed.data.name,
        description: parsed.data.description || null,
        duration_minutes: parsed.data.duration,
        category: parsed.data.category,
        is_active: parsed.data.isActive,
        price_cents: Math.round(parsed.data.price * 100 + Number.EPSILON),
        organization_id: admin.organization_id,
      })

    if (error) return { error: error.message }

    revalidatePath('/admin/services')
    revalidatePath('/barber/services')
    revalidatePath('/client/services')
    return { success: true }
  } catch {
    return { error: 'Erro ao criar serviço.' }
  }
}

/**
 * Atualiza um serviço existente — somente Admin.
 */
export async function updateService(id: string, input: CreateServiceInput) {
  try {
    if (!z.string().uuid().safeParse(id).success) return { error: 'ID inválido' }
    const admin = await requireAdmin()
    const parsed = createServiceSchema.safeParse(input)

    if (!parsed.success) {
      return { error: 'Dados inválidos', issues: parsed.error.flatten() }
    }

    const { error } = await supabaseAdmin
      .from('services')
      .update({
        name: parsed.data.name,
        description: parsed.data.description || null,
        duration_minutes: parsed.data.duration,
        category: parsed.data.category,
        is_active: parsed.data.isActive,
        price_cents: Math.round(parsed.data.price * 100 + Number.EPSILON),
      })
      .eq('id', id)
      .eq('organization_id', admin.organization_id)

    if (error) return { error: error.message }

    revalidatePath('/admin/services')
    revalidatePath('/barber/services')
    revalidatePath('/client/services')
    return { success: true }
  } catch {
    return { error: 'Erro ao atualizar serviço.' }
  }
}

/**
 * Alterna o status ativo/inativo de um serviço — somente Admin.
 */
export async function toggleServiceStatus(id: string, isActive: boolean) {
  try {
    if (!z.string().uuid().safeParse(id).success) return { error: 'ID inválido' }
    const admin = await requireAdmin()

    const { error } = await supabaseAdmin
      .from('services')
      .update({ is_active: isActive })
      .eq('id', id)
      .eq('organization_id', admin.organization_id)

    if (error) return { error: error.message }

    revalidatePath('/admin/services')
    revalidatePath('/barber/services')
    revalidatePath('/client/services')
    return { success: true }
  } catch {
    return { error: 'Erro ao alterar status.' }
  }
}

/**
 * Remove um serviço — somente Admin.
 */
export async function deleteService(id: string) {
  try {
    if (!z.string().uuid().safeParse(id).success) return { error: 'ID inválido' }
    const admin = await requireAdmin()

    const { error } = await supabaseAdmin
      .from('services')
      .delete()
      .eq('id', id)
      .eq('organization_id', admin.organization_id)

    if (error) return { error: error.message }

    revalidatePath('/admin/services')
    revalidatePath('/barber/services')
    revalidatePath('/client/services')
    return { success: true }
  } catch {
    return { error: 'Erro ao remover serviço.' }
  }
}

/**
 * Duplica um serviço existente — somente Admin.
 */
export async function duplicateService(id: string) {
  try {
    if (!z.string().uuid().safeParse(id).success) return { error: 'ID inválido' }
    const admin = await requireAdmin()

    // Busca serviço original
    const { data: original, error: fetchError } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('id', id)
      .eq('organization_id', admin.organization_id)
      .single()

    if (fetchError || !original) return { error: 'Serviço não encontrado.' }

    // Insere cópia
    const { error } = await supabaseAdmin
      .from('services')
      .insert({
        name: `${original.name} (Cópia)`,
        description: original.description,
        duration_minutes: original.duration_minutes,
        category: original.category,
        is_active: false, // Começa inativo
        price_cents: original.price_cents,
        organization_id: admin.organization_id,
      })

    if (error) return { error: error.message }

    revalidatePath('/admin/services')
    return { success: true }
  } catch {
    return { error: 'Erro ao duplicar serviço.' }
  }
}
