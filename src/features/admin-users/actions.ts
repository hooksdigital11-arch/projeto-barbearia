'use server'

import { randomBytes } from 'crypto'
import { z } from 'zod'
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
      password: password || randomBytes(12).toString('base64url'),
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
    
    // Retornar os dados completos para atualização em tempo real na UI
    return { 
      success: true, 
      data: {
        id: authUser.user.id,
        full_name: fullName,
        email,
        phone,
        role,
        specialty,
        organization_id: admin.organization_id,
        status: 'active',
        created_at: new Date().toISOString()
      }
    }

  } catch (err) {
    return { error: 'Ocorreu um erro inesperado ao criar o usuário.' }
  }
}

/**
 * Atualiza os dados de um usuário existente.
 */
export async function updateUser(id: string, input: UpdateUserInput) {
  try {
    if (!z.string().uuid().safeParse(id).success) return { error: 'ID inválido' }
    const admin = await requireAdmin()
    
    const parsed = updateUserSchema.safeParse({ ...input, id })
    if (!parsed.success) {
      return { error: 'Dados inválidos', issues: parsed.error.flatten().fieldErrors }
    }

    const { fullName, email, phone, specialty, status } = parsed.data

    // 1. Atualizar no Auth se o email mudou
    if (email) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        email: email
      })
      if (authError) return { error: `Erro ao atualizar email no Auth: ${authError.message}` }
    }

    // 2. Atualizar no Profile (Database)
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: fullName,
        email,
        phone,
        specialty,
        status
      } as any)
      .eq('id', id)
      .eq('organization_id', admin.organization_id)

    if (error) return { error: error.message }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (err) {
    console.error('Update user error:', err)
    return { error: 'Ocorreu um erro inesperado ao atualizar o usuário.' }
  }
}


/**
 * Alterna o status do usuário entre ativo e inativo.
 */
export async function toggleUserStatus(id: string, currentStatus: string) {
  try {
    if (!z.string().uuid().safeParse(id).success) return { error: 'ID inválido' }
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
    if (!z.string().uuid().safeParse(id).success) return { error: 'ID inválido' }
    const admin = await requireAdmin()
    
    // Prevenção: não permitir que o admin se delete (opcional, mas recomendado)
    if (id === admin.id) {
      return { error: 'Você não pode excluir seu próprio usuário.' }
    }

    // 1. Deletar da tabela profiles (garante isolamento por organization_id)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id)
      .eq('organization_id', admin.organization_id)

    if (profileError) {
      // Erro 23503 é Foreign Key Violation
      if (profileError.code === '23503') {
        return { 
          error: 'Este usuário possui registros vinculados (agendamentos, histórico, etc) e não pode ser removido permanentemente. Recomendamos apenas desativá-lo.' 
        }
      }
      return { error: profileError.message }
    }

    // 2. Remover do Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
    
    if (authError) {
      console.error('Erro ao deletar usuário do Auth:', authError)
      // Continuamos pois o perfil já foi removido, o que resolve a visibilidade na UI
    }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (err) {
    console.error('Delete user error:', err)
    return { error: 'Erro inesperado ao remover usuário.' }
  }
}

