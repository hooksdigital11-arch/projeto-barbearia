import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { enviarMensagem, isEvolutionConfigured } from '@/lib/evolution'

function isValidCronSecret(header: string | null): boolean {
  const secret = process.env.CRON_SECRET
  const provided = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!secret || !provided) return false
  try {
    const a = Buffer.from(provided)
    const b = Buffer.from(secret)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  if (!isValidCronSecret(req.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (!isEvolutionConfigured()) {
    return NextResponse.json({ error: 'Evolution API não configurada', enviados: 0 })
  }

  const now = new Date()
  const in26Hours = new Date(now.getTime() + 26 * 60 * 60 * 1000)
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000)

  const { data: agendamentos, error } = await (supabaseAdmin
    .from('appointments') as any)
    .select(`
      id,
      start_time,
      organization_id,
      lembrete_24h_enviado,
      lembrete_2h_enviado,
      confirmacao_etapa,
      client:clients!appointments_client_id_fkey(full_name, phone),
      barber:profiles!appointments_barber_id_fkey(full_name)
    `)
    .in('status', ['scheduled', 'confirmed'])
    .gte('start_time', threeHoursAgo.toISOString())
    .lte('start_time', in26Hours.toISOString())
    .or('lembrete_24h_enviado.eq.false,lembrete_2h_enviado.eq.false')

  if (error) {
    console.error('[CRON_LEMBRETES]', error.message)
    return NextResponse.json({ error: error.message, enviados: 0 }, { status: 500 })
  }

  let enviados = 0
  let falhas = 0
  const adminPrefsCache = new Map<string, { whatsappConfirmations: boolean; whatsappReminders: boolean }>()

  for (const ag of (agendamentos ?? []) as any[]) {
    const phone: string | null = ag.client?.phone ?? null
    if (!phone) continue

    const orgId = ag.organization_id
    let prefs = adminPrefsCache.get(orgId)
    if (!prefs) {
      const { data: adminProfile } = await supabaseAdmin
        .from('profiles')
        .select('notification_preferences')
        .eq('organization_id', orgId)
        .eq('role', 'admin')
        .limit(1)
        .maybeSingle()

      prefs = {
        whatsappConfirmations: !!adminProfile?.notification_preferences?.whatsappConfirmations,
        whatsappReminders: !!adminProfile?.notification_preferences?.whatsappReminders,
      }
      adminPrefsCache.set(orgId, prefs)
    }

    const startTimeMs = new Date(ag.start_time).getTime()
    const nowMs = now.getTime()
    const hoursDiff = (startTimeMs - nowMs) / (1000 * 60 * 60)

    const nome: string = ag.client?.full_name ?? 'Cliente'
    const barbeiro: string = ag.barber?.full_name ?? 'seu barbeiro'
    const hora = new Date(ag.start_time).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    })
    const dataFormatada = new Date(ag.start_time).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'America/Sao_Paulo',
    })

    let sent = false
    let updateFields: any = {}

    // 1. Confirmação Automática (2h antes)
    if (prefs.whatsappConfirmations && !ag.lembrete_2h_enviado && hoursDiff > 0 && hoursDiff <= 2.2) {
      try {
        await enviarMensagem(
          phone,
          `Olá, ${nome}! ⏰ Seu agendamento com o profissional ${barbeiro} é hoje às ${hora} (daqui a 2 horas). Por favor, confirme respondendo SIM ou OK, ou responda CANCELAR se precisar desmarcar.`
        )
        sent = true
        updateFields = {
          lembrete_2h_enviado: true,
          lembrete_enviado: true,
          confirmacao_etapa: '2h_enviado'
        }
      } catch (e) {
        falhas++
        console.error('[CRON_LEMBRETES] Falha ao enviar lembrete 2h para', ag.id, e)
      }
    }
    // 2. Lembrete 24h (24h antes)
    else if (prefs.whatsappReminders && !ag.lembrete_24h_enviado && hoursDiff > 3 && hoursDiff <= 24.5) {
      try {
        await enviarMensagem(
          phone,
          `Olá, ${nome}! 📅 Confirmando seu agendamento para amanhã, dia ${dataFormatada} às ${hora} com o profissional ${barbeiro}. Você confirma sua presença? Responda com SIM ou OK para confirmar, ou CANCELAR para desmarcar.`
        )
        sent = true
        updateFields = {
          lembrete_24h_enviado: true,
          lembrete_enviado: true,
          confirmacao_etapa: '24h_enviado'
        }
      } catch (e) {
        falhas++
        console.error('[CRON_LEMBRETES] Falha ao enviar lembrete 24h para', ag.id, e)
      }
    }

    if (sent) {
      enviados++
      const { error: updateError } = await supabaseAdmin
        .from('appointments')
        .update(updateFields)
        .eq('id', ag.id)
      if (updateError) {
        console.error('[CRON_LEMBRETES] Falha ao atualizar agendamento', ag.id, updateError.message)
      }

      // Delay de 1.5s entre envios para evitar detecção como spam no WhatsApp
      await new Promise(r => setTimeout(r, 1500))
    }
  }

  return NextResponse.json({ enviados, falhas, total: enviados + falhas })
}

