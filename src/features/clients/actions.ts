'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import { createClientSchema, updateClientSchema, updateNotesSchema } from './schemas'

const REVALIDATE_PATHS = ['/admin/clients', '/barber/clients', '/admin/reports']

function revalidateAll(clientId?: string) {
  REVALIDATE_PATHS.forEach(path => revalidatePath(path))
  if (clientId) {
    revalidatePath(`/admin/clients/${clientId}`)
    revalidatePath(`/barber/clients/${clientId}`)
  }
}

/**
 * Criar novo cliente
 */
export async function createClientAction(formData: FormData) {
  const user = await requireUser()
  if (!['admin', 'barber'].includes(user.role)) return { error: 'Sem permissão' }

  const parsed = createClientSchema.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    email: formData.get('email') || null,
    birthday: formData.get('birthday') || null,
    preferred_barber_id: formData.get('preferred_barber_id') || null,
    notes: formData.get('notes') || null,
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos', issues: parsed.error.flatten() }
  }

  // Verificar duplicata por telefone
  const { data: existing } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('organization_id', user.organization_id)
    .eq('phone', parsed.data.phone)
    .neq('status', 'inactive')
    .limit(1)
    .single()

  if (existing) {
    return { error: 'Já existe um cliente com este telefone' }
  }

  const { error } = await supabaseAdmin.from('clients').insert({
    ...parsed.data,
    organization_id: user.organization_id,
    status: 'active',
    total_visits: 0,
    total_spent_cents: 0,
  })

  if (error) {
    console.error('[CREATE_CLIENT]', error.message)
    return { error: 'Erro ao criar cliente' }
  }

  revalidateAll()
  return { success: true }
}

/**
 * Atualizar cliente existente
 */
export async function updateClientAction(clientId: string, formData: FormData) {
  const user = await requireUser()
  if (!['admin', 'barber'].includes(user.role)) return { error: 'Sem permissão' }

  const rawData: Record<string, unknown> = {
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    email: formData.get('email') || null,
    birthday: formData.get('birthday') || null,
    preferred_barber_id: formData.get('preferred_barber_id') || null,
  }

  // Só admin pode alterar status
  if (user.role === 'admin' && formData.get('status')) {
    rawData.status = formData.get('status')
  }

  const parsed = updateClientSchema.safeParse(rawData)

  if (!parsed.success) {
    return { error: 'Dados inválidos', issues: parsed.error.flatten() }
  }

  const { error } = await supabaseAdmin
    .from('clients')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', clientId)
    .eq('organization_id', user.organization_id)

  if (error) {
    console.error('[UPDATE_CLIENT]', error.message)
    return { error: 'Erro ao atualizar cliente' }
  }

  revalidateAll(clientId)
  return { success: true }
}

/**
 * Atualizar notas do barbeiro
 */
export async function updateClientNotes(clientId: string, notes: string) {
  const user = await requireUser()
  if (!['admin', 'barber'].includes(user.role)) return { error: 'Sem permissão' }

  const parsed = updateNotesSchema.safeParse({ notes })
  if (!parsed.success) return { error: 'Notas inválidas' }

  const { error } = await supabaseAdmin
    .from('clients')
    .update({ notes: parsed.data.notes, updated_at: new Date().toISOString() })
    .eq('id', clientId)
    .eq('organization_id', user.organization_id)

  if (error) {
    console.error('[UPDATE_NOTES]', error.message)
    return { error: 'Erro ao salvar notas' }
  }

  revalidateAll(clientId)
  return { success: true }
}

/**
 * Soft delete — muda status para 'inactive'
 */
export async function deleteClientAction(clientId: string) {
  const user = await requireUser()
  if (user.role !== 'admin') return { error: 'Apenas admin pode remover clientes' }

  const { error } = await supabaseAdmin
    .from('clients')
    .update({ status: 'inactive', updated_at: new Date().toISOString() })
    .eq('id', clientId)
    .eq('organization_id', user.organization_id)

  if (error) {
    console.error('[DELETE_CLIENT]', error.message)
    return { error: 'Erro ao remover cliente' }
  }

  revalidateAll(clientId)
  return { success: true }
}

/**
 * Bloquear cliente (admin only)
 */
export async function blockClientAction(clientId: string) {
  const user = await requireUser()
  if (user.role !== 'admin') return { error: 'Apenas admin pode bloquear clientes' }

  const { error } = await supabaseAdmin
    .from('clients')
    .update({ status: 'blocked', updated_at: new Date().toISOString() })
    .eq('id', clientId)
    .eq('organization_id', user.organization_id)

  if (error) {
    console.error('[BLOCK_CLIENT]', error.message)
    return { error: 'Erro ao bloquear cliente' }
  }

  revalidateAll(clientId)
  return { success: true }
}

/**
 * Reativar cliente (admin only)
 */
export async function reactivateClientAction(clientId: string) {
  const user = await requireUser()
  if (user.role !== 'admin') return { error: 'Apenas admin pode reativar clientes' }

  const { error } = await supabaseAdmin
    .from('clients')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', clientId)
    .eq('organization_id', user.organization_id)

  if (error) {
    console.error('[REACTIVATE_CLIENT]', error.message)
    return { error: 'Erro ao reativar cliente' }
  }

  revalidateAll(clientId)
  return { success: true }
}
