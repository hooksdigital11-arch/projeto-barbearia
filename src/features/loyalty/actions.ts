'use server'

import { z } from 'zod'
import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import { loyaltyConfigSchema, addStampSchema } from './schemas'
import type { LoyaltyConfig } from './types'
import { DEFAULT_LOYALTY_CONFIG } from './types'

/** Admin: salvar configuração do programa */
export async function updateLoyaltyConfig(formData: FormData) {
  const user = await requireUser()
  if (user.role !== 'admin') return { error: 'Sem permissão' }

  const rawData = {
    mode: formData.get('mode'),
    stamps_required: Number(formData.get('stamps_required') || 10),
    points_per_real: Number(formData.get('points_per_real') || 1),
    points_required: Number(formData.get('points_required') || 100),
    reward_service_id: formData.get('reward_service_id') || null,
    reward_description: formData.get('reward_description'),
  }

  const parsed = loyaltyConfigSchema.safeParse(rawData)

  if (!parsed.success) {
    console.error('[UPDATE_LOYALTY_CONFIG] Zod error:', parsed.error.flatten())
    return { error: 'Dados inválidos', issues: parsed.error.flatten() }
  }

  // Usa supabaseAdmin para evitar recursão infinita no RLS de profiles
  const { error } = await supabaseAdmin
    .from('organizations')
    .update({ loyalty_config: parsed.data })
    .eq('id', user.organization_id)

  if (error) {
    console.error('[UPDATE_LOYALTY_CONFIG] DB error:', error.message)
    return { error: `Erro no Banco: ${error.message}` }
  }

  revalidatePath('/admin/loyalty')
  return { success: true }
}

/** Admin/Barbeiro: adicionar carimbo manualmente */
export async function addStamp(clientId: string, formData: FormData) {
  if (!z.string().uuid().safeParse(clientId).success) return { error: 'ID inválido' }
  const user = await requireUser()
  if (!['admin', 'barber'].includes(user.role)) return { error: 'Sem permissão' }

  const parsed = addStampSchema.safeParse({
    amount: Number(formData.get('amount') || 1),
    notes: formData.get('notes') || 'Carimbo manual',
  })

  if (!parsed.success) return { error: 'Dados inválidos' }

  const { error } = await supabaseAdmin
    .from('loyalty_stamps')
    .insert({
      organization_id: user.organization_id,
      client_id: clientId,
      type: 'stamp',
      amount: parsed.data.amount,
      notes: parsed.data.notes,
    })

  if (error) {
    console.error('[ADD_STAMP]', error.message)
    return { error: 'Erro ao adicionar carimbo' }
  }

  revalidatePath('/admin/loyalty')
  revalidatePath('/barber/loyalty')
  revalidatePath('/client/loyalty')
  return { success: true }
}

/** Admin: remover carimbo manualmente */
export async function removeStamp(clientId: string) {
  if (!z.string().uuid().safeParse(clientId).success) return { error: 'ID inválido' }
  const user = await requireUser()
  if (user.role !== 'admin') return { error: 'Sem permissão' }

  const { error } = await supabaseAdmin
    .from('loyalty_stamps')
    .insert({
      organization_id: user.organization_id,
      client_id: clientId,
      type: 'stamp',
      amount: -1,
      notes: 'Remoção manual pelo admin',
    })

  if (error) {
    console.error('[REMOVE_STAMP]', error.message)
    return { error: 'Erro ao remover carimbo' }
  }

  revalidatePath('/admin/loyalty')
  return { success: true }
}

/** Cliente: resgatar benefício */
export async function redeemReward(clientId: string) {
  if (!z.string().uuid().safeParse(clientId).success) return { error: 'ID inválido' }
  const user = await requireUser()

  // Clientes só podem resgatar o próprio registro
  if (user.role === 'client') {
    const { data: ownClient } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('organization_id', user.organization_id)
      .eq('profile_id', user.id)
      .maybeSingle()
    if (!ownClient) return { error: 'Sem permissão para resgatar este benefício' }
  }

  // Buscar saldo — usa admin para bypassar RLS
  const { data: stamps } = await supabaseAdmin
    .from('loyalty_stamps')
    .select('type, amount')
    .eq('organization_id', user.organization_id)
    .eq('client_id', clientId)
    .order('created_at', { ascending: true })

  if (!stamps) return { error: 'Nenhum carimbo encontrado' }

  let balance = 0
  for (const stamp of stamps) {
    if (stamp.type === 'redeem') balance = 0
    else balance += stamp.amount
  }

  // Buscar config
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('loyalty_config')
    .eq('id', user.organization_id)
    .single()

  const config = (org?.loyalty_config as unknown as LoyaltyConfig) || DEFAULT_LOYALTY_CONFIG
  const goal = config.mode === 'stamps'
    ? config.stamps_required
    : config.points_required

  if (balance < goal) {
    return { error: 'Carimbos insuficientes para resgatar' }
  }

  const code = `FIDE-${new Date().getFullYear()}-${randomBytes(3).toString('hex').toUpperCase()}`

  const { error } = await supabaseAdmin
    .from('loyalty_stamps')
    .insert({
      organization_id: user.organization_id,
      client_id: clientId,
      type: 'redeem',
      amount: goal,
      notes: `Resgate: ${config.reward_description} | Código: ${code}`,
    })

  if (error) {
    console.error('[REDEEM_REWARD]', error.message)
    return { error: 'Erro ao processar resgate' }
  }

  revalidatePath('/client/loyalty')
  revalidatePath('/admin/loyalty')
  return { success: true, code, reward: config.reward_description }
}

/** Automático: adicionar carimbo após atendimento completado (chamado internamente pelo comanda) */
export async function addStampAfterAppointment(
  organizationId: string,
  clientId: string,
  appointmentId: string,
  priceCents: number
) {
  if (!z.string().uuid().safeParse(organizationId).success) return
  if (!z.string().uuid().safeParse(clientId).success) return
  if (appointmentId && !z.string().uuid().safeParse(appointmentId).success) return

  // Garantir que o cliente pertence à organização informada (evita injeção cross-org)
  const { data: clientCheck } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('organization_id', organizationId)
    .maybeSingle()
  if (!clientCheck) return

  // Buscar config via admin (sem RLS)
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('loyalty_config')
    .eq('id', organizationId)
    .single()

  const config = (org?.loyalty_config as unknown as LoyaltyConfig) || DEFAULT_LOYALTY_CONFIG
  const amount =
    config.mode === 'points'
      ? Math.floor(priceCents / 100) * (config.points_per_real || 1)
      : 1

  await supabaseAdmin.from('loyalty_stamps').insert({
    organization_id: organizationId,
    client_id: clientId,
    appointment_id: appointmentId || null,
    type: 'stamp',
    amount,
    notes: 'Automático após atendimento',
  })
}