import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { enviarMensagem, isEvolutionConfigured } from '@/lib/evolution'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (!isEvolutionConfigured()) {
    return NextResponse.json({ error: 'Evolution API não configurada', enviados: 0 })
  }

  const amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)
  const dataInicio = amanha.toISOString().split('T')[0] + 'T00:00:00.000Z'
  const dataFim = amanha.toISOString().split('T')[0] + 'T23:59:59.999Z'

  const { data: agendamentos, error } = await (supabaseAdmin
    .from('appointments') as any)
    .select(`
      id,
      start_time,
      organization_id,
      client:clients!appointments_client_id_fkey(full_name, phone),
      barber:profiles!appointments_barber_id_fkey(full_name)
    `)
    .in('status', ['scheduled', 'confirmed'])
    .eq('lembrete_enviado', false)
    .gte('start_time', dataInicio)
    .lte('start_time', dataFim)

  if (error) {
    console.error('[CRON_LEMBRETES]', error.message)
    return NextResponse.json({ error: error.message, enviados: 0 }, { status: 500 })
  }

  let enviados = 0
  const ids: string[] = []

  for (const ag of (agendamentos ?? []) as any[]) {
    const phone: string | null = ag.client?.phone ?? null
    if (!phone) continue

    const hora = new Date(ag.start_time).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    })
    const nome: string = ag.client?.full_name ?? 'Cliente'
    const barbeiro: string = ag.barber?.full_name ?? 'seu barbeiro'

    try {
      await enviarMensagem(
        phone,
        `Oi, ${nome}! 📅 Lembrando que amanhã você tem horário às ${hora} com ${barbeiro}. Qualquer dúvida, é só responder aqui!`
      )
      enviados++
      ids.push(ag.id)
    } catch (e) {
      console.error('[CRON_LEMBRETES] Falha ao enviar para', ag.id, e)
    }
  }

  if (ids.length > 0) {
    await (supabaseAdmin.from('appointments') as any)
      .update({ lembrete_enviado: true })
      .in('id', ids)
  }

  return NextResponse.json({ enviados })
}
