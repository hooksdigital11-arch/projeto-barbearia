'use server'

import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  generalSettingsSchema,
  businessHoursSchema,
  serviceSchema,
  notificationPreferencesSchema,
  adminProfileSchema
} from './schemas'
import type { 
  GeneralSettingsInput, 
  BusinessHoursInput, 
  ServiceInput, 
  NotificationPreferencesInput,
  AdminProfileInput
} from './schemas'

import { createClient } from '@/lib/supabase/server'

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual obrigatória'),
  newPassword: z.string().min(8, 'Mínimo de 8 caracteres'),
})

/**
 * 1. Atualiza Configurações Gerais
 */
export async function updatePassword(currentPassword: string, newPassword: string) {
  try {
    const parsed = updatePasswordSchema.safeParse({ currentPassword, newPassword })
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Dados inválidos' }

    const admin = await requireAdmin()
    const supabase = await createClient()

    // Verifica a senha atual tentando fazer login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: admin.email || '',
      password: currentPassword,
    })

    if (signInError) {
      return { error: 'A senha atual está incorreta.' }
    }

    // Se passou, atualiza para a nova senha
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return { error: updateError.message }
    }

    return { success: true }
  } catch (err) {
    return { error: 'Erro inesperado ao alterar a senha.' }
  }
}

/**
 * 1. Atualiza Configurações Gerais
 */
export async function updateGeneralSettings(input: GeneralSettingsInput) {
  try {
    const admin = await requireAdmin()
    const parsed = generalSettingsSchema.safeParse(input)
    if (!parsed.success) return { error: 'Dados inválidos', issues: parsed.error.flatten() }

    const { error } = await supabaseAdmin
      .from('organizations')
      .update({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        address: parsed.data.address,
        address_number: parsed.data.number,
        neighborhood: parsed.data.neighborhood,
        city: parsed.data.city,
        state: parsed.data.state,
        zip_code: parsed.data.zipCode,
        description: parsed.data.description,
        logo_url: parsed.data.logoUrl,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', admin.organization_id)

    if (error) return { error: error.message }
    
    revalidateTag('organization-settings')
    revalidatePath('/admin/settings/general')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err) {
    return { error: 'Erro inesperado ao salvar.' }
  }
}

/**
 * 2. Atualiza Horários de Funcionamento
 */
export async function updateBusinessHours(input: BusinessHoursInput) {
  try {
    const admin = await requireAdmin()
    const parsed = businessHoursSchema.safeParse(input)
    if (!parsed.success) return { error: 'Horários inválidos' }

    const { error } = await supabaseAdmin
      .from('organizations')
      .update({ business_hours: parsed.data } as any)
      .eq('id', admin.organization_id)

    if (error) return { error: error.message }
    
    revalidateTag('organization-settings')
    revalidatePath('/admin/settings/services')
    return { success: true }
  } catch (err) {
    return { error: 'Erro ao salvar horários.' }
  }
}

/**
 * 3. Gerenciamento de Serviços
 */
export async function createService(input: ServiceInput) {
  try {
    const admin = await requireAdmin()
    const parsed = serviceSchema.safeParse(input)
    if (!parsed.success) return { error: 'Dados inválidos' }

    const { error } = await supabaseAdmin
      .from('services')
      .insert({
        name: parsed.data.name,
        description: parsed.data.description,
        duration: parsed.data.duration,
        category: parsed.data.category,
        is_active: parsed.data.isActive,
        price_cents: Math.round(parsed.data.price * 100),
        organization_id: admin.organization_id
      } as any)

    if (error) return { error: error.message }
    
    revalidateTag('services-settings')
    revalidatePath('/admin/settings/services')
    return { success: true }
  } catch (err) {
    return { error: 'Erro ao criar serviço.' }
  }
}

export async function updateService(id: string, input: ServiceInput) {
  try {
    if (!z.string().uuid().safeParse(id).success) return { error: 'ID inválido' }
    const admin = await requireAdmin()
    const parsed = serviceSchema.safeParse(input)
    if (!parsed.success) return { error: 'Dados inválidos' }

    const { error } = await supabaseAdmin
      .from('services')
      .update({
        name: parsed.data.name,
        description: parsed.data.description,
        duration: parsed.data.duration,
        category: parsed.data.category,
        is_active: parsed.data.isActive,
        price_cents: Math.round(parsed.data.price * 100)
      } as any)
      .eq('id', id)
      .eq('organization_id', admin.organization_id)

    if (error) return { error: error.message }
    
    revalidateTag('services-settings')
    revalidatePath('/admin/settings/services')
    return { success: true }
  } catch (err) {
    return { error: 'Erro ao atualizar serviço.' }
  }
}

export async function toggleServiceStatus(id: string, isActive: boolean) {
  try {
    if (!z.string().uuid().safeParse(id).success) return { error: 'ID inválido' }
    const admin = await requireAdmin()
    const { error } = await supabaseAdmin
      .from('services')
      .update({ is_active: isActive } as any)
      .eq('id', id)
      .eq('organization_id', admin.organization_id)

    if (error) return { error: error.message }
    
    revalidateTag('services-settings')
    revalidatePath('/admin/settings/services')
    return { success: true }
  } catch (err) {
    return { error: 'Erro ao alterar status.' }
  }
}

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
    
    revalidateTag('services-settings')
    revalidatePath('/admin/settings/services')
    return { success: true }
  } catch (err) {
    return { error: 'Erro ao remover serviço.' }
  }
}

/**
 * 4. Notificações
 */
export async function updateNotifications(input: NotificationPreferencesInput) {
  try {
    const admin = await requireAdmin()
    const parsed = notificationPreferencesSchema.safeParse(input)
    if (!parsed.success) return { error: 'Preferências inválidas' }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ notification_preferences: parsed.data } as any)
      .eq('id', admin.id)

    if (error) return { error: error.message }
    revalidatePath('/admin/settings/notifications')
    return { success: true }
  } catch (err) {
    return { error: 'Erro ao salvar preferências.' }
  }
}

/**
 * 7. Perfil Admin
 */
export async function updateAdminProfile(input: AdminProfileInput) {
  try {
    const admin = await requireAdmin()
    const parsed = adminProfileSchema.safeParse(input)
    if (!parsed.success) return { error: 'Dados inválidos' }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        bio: parsed.data.bio
      } as any)
      .eq('id', admin.id)

    if (error) return { error: error.message }
    revalidatePath('/admin/settings/profile')
    return { success: true }
  } catch (err) {
    return { error: 'Erro ao atualizar perfil.' }
  }
}

/**
 * 8. Zona de Perigo
 */
export async function deactivateOrganization() {
  try {
    const admin = await requireAdmin()
    const { error } = await supabaseAdmin
      .from('organizations')
      .update({ status: 'inactive' } as any)
      .eq('id', admin.organization_id)

    if (error) return { error: error.message }
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (err) {
    return { error: 'Erro ao desativar.' }
  }
}

/**
 * Reativa a Organização
 */
export async function activateOrganization() {
  try {
    const admin = await requireAdmin()
    const { error } = await supabaseAdmin
      .from('organizations')
      .update({ status: 'active' } as any)
      .eq('id', admin.organization_id)

    if (error) return { error: error.message }
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (err) {
    return { error: 'Erro ao reativar.' }
  }
}

/**
 * 9. Upload de Logo (Storage)
 */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function uploadLogo(formData: FormData) {
  try {
    const admin = await requireAdmin()
    const file = formData.get('file') as File
    if (!file) return { error: 'Nenhum arquivo enviado' }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { error: 'Formato inválido. Use JPG, PNG, WebP ou GIF.' }
    }
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      return { error: 'Arquivo muito grande. Máximo 5MB.' }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${admin.organization_id}/logo-${Date.now()}.${fileExt}`

    // Faz o upload usando o admin client (ignora RLS do bucket)
    const { error } = await supabaseAdmin.storage
      .from('logos')
      .upload(fileName, file, { 
        upsert: true,
        contentType: file.type 
      })

    if (error) {
      console.error('[UPLOAD_LOGO] Error:', error.message)
      return { error: error.message }
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('logos')
      .getPublicUrl(fileName)

    // Salva a URL da logo diretamente no banco para atualizar a sidebar em tempo real
    const { error: dbError } = await supabaseAdmin
      .from('organizations')
      .update({ logo_url: publicUrl, updated_at: new Date().toISOString() } as any)
      .eq('id', admin.organization_id)

    if (dbError) {
      console.error('[UPLOAD_LOGO] DB Error:', dbError.message)
    }

    // Revalida o layout inteiro para a sidebar atualizar
    revalidatePath('/', 'layout')

    return { success: true, url: publicUrl }
  } catch (err) {
    console.error('[UPLOAD_LOGO] Catch:', err)
    return { error: 'Erro interno no servidor durante upload.' }
  }
}
