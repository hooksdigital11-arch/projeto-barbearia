'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-auth'
import { createUserSchema, updateUserSchema } from './schemas'
import type { CreateUserInput, UpdateUserInput } from './schemas'

/**
 * Cria um novo usuário (Barbeiro ou Admin) no sistema.
 * Realiza a criação no Auth e sincroniza com a tabela de profiles.
 */
export async function createUser(input: CreateUserInput) {
  try {
    const admin = await requireAdmin()
    
    const parsed = createUserSchema.safeParse(input)
    if (!parsed.success) {
      return { error: 'Dados inválidos', issues: parsed.error.flatten().fieldErrors }
    }

    const { fullName, email, phone, role, specialty, password, autoConfirm } = parsed.data

    // 1. Criar no Auth via Admin API (ignora confirmação se autoConfirm for true)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password || Math.random().toString(36).slice(-10),
      email_confirm: autoConfirm,
      user_metadata: { 
        full_name: fullName, 
        phone 
      }
    })

    if (authError) return { error: authError.message }

    // 2. Atualizar o profile que o trigger deve ter criado
    // (Ou criar se o trigger falhar, mas usamos update para segurança)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: fullName,
        role,
        organization_id: admin.organization_id,
        // Campos que podem existir no banco conforme a feature:
        email,
        phone,
        specialty,
        status: 'active'
      } as any) // Cast to any to avoid TS errors with missing columns in types
      .eq('id', authUser.user.id)

    if (profileError) {
      // Cleanup auth user if profile update fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return { error: `Erro ao salvar perfil: ${profileError.message}` }
    }

    revalidatePath('/admin/users')
    return { success: true, data: authUser.user }
  } catch (err) {
    return { error: 'Ocorreu um erro inesperado ao criar o usuário.' }
  }
}

/**
 * Atualiza os dados de um usuário existente.
 */
export async function updateUser(id: string, input: UpdateUserInput) {
  try {
    const admin = await requireAdmin()
    
    const parsed = updateUserSchema.safeParse({ ...input, id })
    if (!parsed.success) {
      return { error: 'Dados inválidos', issues: parsed.error.flatten().fieldErrors }
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(parsed.data as any)
      .eq('id', id)
      .eq('organization_id', admin.organization_id)

    if (error) return { error: error.message }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (err) {
    return { error: 'Ocorreu um erro inesperado ao atualizar o usuário.' }
  }
}

/**
 * Alterna o status do usuário entre ativo e inativo.
 */
export async function toggleUserStatus(id: string, currentStatus: string) {
  try {
    const admin = await requireAdmin()
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ status: newStatus } as any)
      .eq('id', id)
      .eq('organization_id', admin.organization_id)

    if (error) return { error: error.message }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (err) {
    return { error: 'Erro ao alterar status.' }
  }
}

/**
 * Realiza um "soft delete" ou desativação permanente do usuário.
 */
export async function deleteUser(id: string) {
  try {
    const admin = await requireAdmin()
    
    // Por segurança e integridade, usamos soft delete mudando status
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'inactive' } as any)
      .eq('id', id)
      .eq('organization_id', admin.organization_id)

    if (error) return { error: error.message }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (err) {
    return { error: 'Erro ao remover usuário.' }
  }
}
