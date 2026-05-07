'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
} from './schemas'
import { checkTimeConflict } from './queries'

const REVALIDATE_PATHS = [
  '/admin/appointments',
  '/barber/appointments',
  '/agendamentos',
  '/admin/reports'
]

function revalidateAll() {
  REVALIDATE_PATHS.forEach(p => revalidatePath(p))
}

/**
 * Criar agendamento com validação de conflito de horário.
 */
export async function createAppointment(formData: FormData) {
  const user = await requireUser()
  if (!['admin', 'barber'].includes(user.role)) {
    return { error: 'Sem permissão' }
  }

  const parsed = createAppointmentSchema.safeParse({
    client_id: formData.get('client_id'),
    service_id: formData.get('service_id'),
    barber_id: formData.get('barber_id'),
    start_time: formData.get('start_time'),
    notes: formData.get('notes') || null,
    price_cents: Number(formData.get('price_cents') || 0),
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos', issues: parsed.error.flatten() }
  }

  const { client_id, service_id, barber_id, start_time, notes, price_cents } = parsed.data

  // Buscar duração do serviço
  const { data: service } = await supabaseAdmin
    .from('services')
    .select('duration_minutes, price_cents')
    .eq('id', service_id)
    .single()

  if (!service) return { error: 'Serviço não encontrado' }

  const startDt = new Date(start_time)
  const endDt = new Date(startDt.getTime() + service.duration_minutes * 60 * 1000)

  // Verificar conflito de horário
  const hasConflict = await checkTimeConflict(
    barber_id,
    startDt.toISOString(),
    endDt.toISOString()
  )

  if (hasConflict) {
    return { error: 'Este horário já está ocupado para o barbeiro selecionado' }
  }

  const { data, error } = await (supabaseAdmin
    .from('appointments') as any)
    .insert({
      organization_id: user.organization_id,
      client_id,
      service_id,
      barber_id,
      start_time: startDt.toISOString(),
      end_time: endDt.toISOString(),
      duration_minutes: service.duration_minutes,
      status: 'scheduled',
      price_cents: price_cents || service.price_cents,
      notes: notes || null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[CREATE_APPOINTMENT]', error.message)
    return { error: 'Erro ao criar agendamento' }
  }

  revalidateAll()
  return { success: true, id: data.id }
}

/**
 * Atualizar dados de um agendamento (remarcar, editar).
 */
export async function updateAppointment(formData: FormData) {
  const user = await requireUser()
  if (!['admin', 'barber'].includes(user.role)) {
    return { error: 'Sem permissão' }
  }

  const parsed = updateAppointmentSchema.safeParse({
    id: formData.get('id'),
    client_id: formData.get('client_id') || undefined,
    service_id: formData.get('service_id') || undefined,
    barber_id: formData.get('barber_id') || undefined,
    start_time: formData.get('start_time') || undefined,
    notes: formData.get('notes') || null,
    price_cents: formData.get('price_cents') ? Number(formData.get('price_cents')) : undefined,
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos', issues: parsed.error.flatten() }
  }

  const { id, barber_id, start_time, service_id, ...rest } = parsed.data

  let updatePayload: Record<string, unknown> = { ...rest }

  if (start_time && (barber_id || service_id)) {
    // Recompute end_time
    const targetBarberId = barber_id ?? (
      await supabaseAdmin.from('appointments').select('barber_id').eq('id', id).single()
    ).data?.barber_id

    const targetServiceId = service_id ?? (
      await supabaseAdmin.from('appointments').select('service_id').eq('id', id).single()
    ).data?.service_id

    if (targetServiceId) {
      const { data: svc } = await supabaseAdmin
        .from('services')
        .select('duration_minutes')
        .eq('id', targetServiceId)
        .single()

      if (svc) {
        const startDt = new Date(start_time)
        const endDt = new Date(startDt.getTime() + svc.duration_minutes * 60 * 1000)

        if (targetBarberId) {
          const hasConflict = await checkTimeConflict(
            targetBarberId,
            startDt.toISOString(),
            endDt.toISOString(),
            id
          )
          if (hasConflict) {
            return { error: 'Este horário já está ocupado para o barbeiro selecionado' }
          }
        }

        updatePayload = {
          ...updatePayload,
          start_time: startDt.toISOString(),
          end_time: endDt.toISOString(),
          duration_minutes: svc.duration_minutes,
        }
      }
    }

    if (barber_id) updatePayload.barber_id = barber_id
    if (service_id) updatePayload.service_id = service_id
  } else if (start_time) {
    updatePayload.start_time = start_time
  }

  const { error } = await (supabaseAdmin
    .from('appointments') as any)
    .update(updatePayload)
    .eq('id', id)
    .eq('organization_id', user.organization_id)

  if (error) {
    console.error('[UPDATE_APPOINTMENT]', error.message)
    return { error: 'Erro ao atualizar agendamento' }
  }

  revalidateAll()
  return { success: true }
}

/**
 * Atualizar status do agendamento (Confirmar, Iniciar, Finalizar, Cancelar, No-show).
 */
export async function updateAppointmentStatus(formData: FormData) {
  const user = await requireUser()
  if (!['admin', 'barber'].includes(user.role)) {
    return { error: 'Sem permissão' }
  }

  const parsed = updateAppointmentStatusSchema.safeParse({
    id: formData.get('id'),
    status: formData.get('status'),
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos' }
  }

  const { data: apptBefore } = await supabaseAdmin
    .from('appointments')
    .select('status, price_cents, client_id')
    .eq('id', parsed.data.id)
    .single()

  let query = (supabaseAdmin
    .from('appointments') as any)
    .update({ status: parsed.data.status as string })
    .eq('id', parsed.data.id)
    .eq('organization_id', user.organization_id)

  // Barbeiro só pode atualizar seus próprios agendamentos
  if (user.role === 'barber') {
    query = query.eq('barber_id', user.id)
  }

  const { error } = await query

  if (!error && parsed.data.status === 'completed' && apptBefore?.status !== 'completed') {
    // Atualiza os status do cliente manualmente (já que a trigger SQL pode não estar ativa)
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('total_visits, total_spent_cents')
      .eq('id', apptBefore.client_id)
      .single()
      
    if (client) {
      await supabaseAdmin
        .from('clients')
        .update({
          total_visits: (client.total_visits || 0) + 1,
          total_spent_cents: (client.total_spent_cents || 0) + (apptBefore.price_cents || 0),
          last_visit_at: new Date().toISOString()
        })
        .eq('id', apptBefore.client_id)
    }
  }

  const { error: queryError } = { error }

  if (error) {
    console.error('[UPDATE_STATUS]', error.message)
    return { error: 'Erro ao atualizar status' }
  }

  revalidateAll()
  return { success: true }
}

/**
 * Cancelar agendamento (soft: status = 'cancelled').
 */
export async function cancelAppointment(appointmentId: string) {
  const user = await requireUser()
  if (!['admin', 'barber'].includes(user.role)) {
    return { error: 'Sem permissão' }
  }

  let query = supabaseAdmin
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)
    .eq('organization_id', user.organization_id)

  if (user.role === 'barber') {
    query = query.eq('barber_id', user.id)
  }

  const { error } = await query

  if (error) {
    console.error('[CANCEL_APPOINTMENT]', error.message)
    return { error: 'Erro ao cancelar' }
  }

  revalidateAll()
  return { success: true }
}
