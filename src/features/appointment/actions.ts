'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser, requireClient } from '@/lib/auth/require-auth'
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
  createClientAppointmentSchema,
} from './schemas'
import { checkTimeConflict } from './queries'
import { enviarMensagem, isEvolutionConfigured } from '@/lib/evolution'

function parseLocalTime(timeStr: string): Date {
  if (!timeStr) return new Date()
  if (timeStr.includes('Z') || /[-+]\d{2}:\d{2}$/.test(timeStr)) {
    return new Date(timeStr)
  }
  return new Date(`${timeStr}-03:00`)
}

async function notificarAgendamento(
  clientId: string,
  barberId: string,
  startTime: string,
  tipo: 'confirmacao' | 'cancelamento'
) {
  if (!isEvolutionConfigured()) return
  try {
    const [{ data: client }, { data: barber }] = await Promise.all([
      supabaseAdmin.from('clients').select('full_name, phone').eq('id', clientId).single(),
      supabaseAdmin.from('profiles').select('full_name').eq('id', barberId).single(),
    ])
    if (!client?.phone) return
    const dt = new Date(startTime)
    const data = dt.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    const hora = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
    const nome = client.full_name
    const barbeiro = barber?.full_name ?? 'seu barbeiro'
    const msg = tipo === 'confirmacao'
      ? `Olá, ${nome}! ✂️ Seu agendamento foi confirmado para ${data} às ${hora} com ${barbeiro}. Até lá!`
      : `Olá, ${nome}! Seu agendamento de ${data} às ${hora} foi cancelado. Entre em contato para remarcar.`
    await enviarMensagem(client.phone, msg)
  } catch (e) {
    console.error('[NOTIFICAR_AGENDAMENTO]', tipo, e)
  }
}

const DAY_KEYS: string[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

type DayHours = { isOpen?: boolean; open?: string; close?: string; pauseStart?: string; pauseEnd?: string }

function isWithinBusinessHours(
  startDt: Date,
  hours: Record<string, DayHours> | null | undefined
): { allowed: boolean; reason?: string } {
  if (!hours) return { allowed: true }
  const dayKey = DAY_KEYS[startDt.getDay()] as string | undefined
  if (!dayKey) return { allowed: true }
  const day = hours[dayKey] as DayHours | undefined
  if (!day?.isOpen) return { allowed: false, reason: 'Barbearia fechada neste dia' }
  if (!day.open || !day.close) return { allowed: true }
  const timeStr = startDt.toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo', hour12: false,
  })
  if (timeStr < day.open || timeStr >= day.close) {
    return { allowed: false, reason: `Fora do horário de funcionamento (${day.open}–${day.close})` }
  }
  if (day.pauseStart && day.pauseEnd && timeStr >= day.pauseStart && timeStr < day.pauseEnd) {
    return { allowed: false, reason: `Horário de pausa (${day.pauseStart}–${day.pauseEnd})` }
  }
  return { allowed: true }
}

const REVALIDATE_PATHS = [
  '/admin/appointments',
  '/barber/appointments',
  '/client/appointments',
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

  const startDt = parseLocalTime(start_time)
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

  // Notificação de confirmação (fire-and-forget)
  notificarAgendamento(client_id, barber_id, start_time, 'confirmacao')

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
        const startDt = parseLocalTime(start_time)
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
    updatePayload.start_time = parseLocalTime(start_time).toISOString()
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

  if (!error && parsed.data.status === 'completed' && apptBefore && apptBefore.status !== 'completed') {
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

  if (error) {
    console.error('[UPDATE_STATUS]', error.message)
    return { error: 'Erro ao atualizar status' }
  }

  revalidateAll()
  return { success: true }
}

/**
 * Cancelar agendamento (soft: status = 'cancelled').
 * Admin/Barber: cancelam qualquer agendamento da organização.
 * Client: cancela apenas os seus próprios agendamentos.
 */
export async function cancelAppointment(appointmentId: string) {
  const user = await requireUser()

  let query = supabaseAdmin
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)
    .eq('organization_id', user.organization_id)

  if (user.role === 'barber') {
    query = query.eq('barber_id', user.id)
  } else if (user.role === 'client') {
    // Client can only cancel their own appointment — look up their clients.id first
    const { data: clientRow } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('organization_id', user.organization_id)
      .eq('profile_id', user.id)
      .single()
    if (!clientRow) return { error: 'Perfil de cliente não encontrado' }
    query = query.eq('client_id', clientRow.id)
  }

  const { error } = await query

  if (error) {
    console.error('[CANCEL_APPOINTMENT]', error.message)
    return { error: 'Erro ao cancelar' }
  }

  // Notificação de cancelamento (fire-and-forget)
  ;(async () => {
    const { data: appt } = await supabaseAdmin
      .from('appointments')
      .select('client_id, barber_id, start_time')
      .eq('id', appointmentId)
      .single()
    if (appt) await notificarAgendamento(appt.client_id, appt.barber_id, appt.start_time, 'cancelamento')
  })().catch(() => undefined)

  revalidateAll()
  return { success: true }
}

/**
 * Cliente agenda para si mesmo.
 */
export async function createClientAppointment(formData: FormData) {
  const user = await requireClient()

  const parsed = createClientAppointmentSchema.safeParse({
    service_id: formData.get('service_id'),
    barber_id: formData.get('barber_id'),
    start_time: formData.get('start_time'),
    notes: formData.get('notes') || null,
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos', issues: parsed.error.flatten() }
  }

  const { data: clientRows } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('organization_id', user.organization_id)
    .eq('profile_id', user.id)
    .limit(1)

  let clientRow = clientRows?.[0] || null

  if (!clientRow) {
    const phoneFilter = user.phone ? `phone.eq.${user.phone}` : ''
    const emailFilter = user.email ? `email.eq.${user.email}` : ''
    const orFilter = [phoneFilter, emailFilter].filter(Boolean).join(',')

    if (orFilter) {
      const { data: matchedClient } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('organization_id', user.organization_id)
        .or(orFilter)
        .is('profile_id', null)
        .limit(1)
        .maybeSingle()

      if (matchedClient) {
        await supabaseAdmin
          .from('clients')
          .update({ profile_id: user.id })
          .eq('id', matchedClient.id)
        clientRow = { id: matchedClient.id }
      }
    }

    if (!clientRow) {
      const { data: newClient } = await supabaseAdmin
        .from('clients')
        .insert({
          organization_id: user.organization_id,
          profile_id: user.id,
          full_name: user.full_name || 'Cliente',
          email: user.email || null,
          phone: user.phone || null,
          status: 'active',
          total_visits: 0,
          total_spent_cents: 0
        })
        .select('id')
        .single()

      if (newClient) {
        clientRow = { id: newClient.id }
      }
    }
  }

  if (!clientRow) return { error: 'Perfil de cliente não pôde ser criado. Fale com a barbearia.' }

  const { service_id, barber_id, start_time, notes } = parsed.data

  const { data: service } = await supabaseAdmin
    .from('services')
    .select('duration_minutes, price_cents')
    .eq('id', service_id)
    .single()

  if (!service) return { error: 'Serviço não encontrado' }

  const startDt = parseLocalTime(start_time)

  if (startDt <= new Date()) {
    return { error: 'Não é possível agendar em data/hora passada' }
  }

  // Validar horário de funcionamento da barbearia
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('business_hours')
    .eq('id', user.organization_id)
    .single()

  const hoursCheck = isWithinBusinessHours(startDt, (org as any)?.business_hours)
  if (!hoursCheck.allowed) {
    return { error: hoursCheck.reason || 'Horário fora do funcionamento da barbearia' }
  }

  const endDt = new Date(startDt.getTime() + service.duration_minutes * 60 * 1000)

  const hasConflict = await checkTimeConflict(barber_id, startDt.toISOString(), endDt.toISOString())
  if (hasConflict) return { error: 'Horário indisponível para o barbeiro selecionado' }

  const { data, error } = await (supabaseAdmin
    .from('appointments') as any)
    .insert({
      client_id: clientRow.id,
      service_id,
      barber_id,
      start_time: startDt.toISOString(),
      end_time: endDt.toISOString(),
      duration_minutes: service.duration_minutes,
      price_cents: service.price_cents,
      status: 'scheduled',
      organization_id: user.organization_id,
      notes: notes || null,
    })
    .select('id')
    .single()

  if (error) return { error: 'Erro ao criar agendamento' }

  // Notificação de confirmação (fire-and-forget)
  notificarAgendamento(clientRow.id, barber_id, startDt.toISOString(), 'confirmacao')

  revalidatePath('/client/appointments')
  return { success: true, data }
}
