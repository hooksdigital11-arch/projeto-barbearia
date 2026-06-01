import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { enviarMensagem } from '@/lib/evolution'

function isValidSecret(provided: string | null): boolean {
  const expected = process.env.WEBHOOK_SECRET
  if (!expected || !provided) return false
  try {
    const a = Buffer.from(provided)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/**
 * Normaliza o evento da Evolution para lowercase dot notation.
 * A Evolution 2.x envia "MESSAGES_UPSERT", queremos "messages.upsert".
 */
function normalizeEvent(raw: string | undefined): string {
  if (!raw) return ''
  return raw.toLowerCase().replace(/_/g, '.')
}

/**
 * Converte número vindo da Evolution (ex: "5531991628771")
 * para o formato salvo no banco (ex: "(31) 99162-8771")
 */
function formatPhoneForDB(digits: string): string {
  const local = digits.replace(/^55/, '')

  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`
  }

  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`
  }

  return local
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const body = (() => { try { return JSON.parse(rawBody) } catch { return null } })()

  // Validação de assinatura antes de qualquer processamento
  if (!isValidSecret(req.headers.get('x-webhook-secret'))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (!body) return NextResponse.json({ ok: true })

  const event = normalizeEvent(body.event)

  // ── Mensagem recebida ──────────────────────────────────────────────────────
  if (event === 'messages.upsert') {
    const msg = body.data

    // Ignora mensagens enviadas pelo próprio número
    if (msg?.key?.fromMe) {
      return NextResponse.json({ ok: true })
    }

    const jid: string = msg?.key?.remoteJid ?? ''
    const rawDigits = jid.replace('@s.whatsapp.net', '').replace(/\D/g, '')

    const content: string =
      msg?.message?.conversation ??
      msg?.message?.extendedTextMessage?.text ??
      ''

    if (!rawDigits || !content) {
      console.log('[WEBHOOK_DIAG] mensagem ignorada: sem telefone ou conteúdo', { rawDigits, hasContent: !!content })
      return NextResponse.json({ ok: true })
    }

    const organizationId = process.env.EVOLUTION_ORGANIZATION_ID
    if (!organizationId) {
      console.error('[WEBHOOK_EVOLUTION] EVOLUTION_ORGANIZATION_ID não configurado — webhook rejeitado')
      return NextResponse.json({ error: 'Configuração ausente' }, { status: 500 })
    }

    const phoneFormatted = formatPhoneForDB(rawDigits)

    // Tenta encontrar o cliente pelo telefone formatado
    let client: { id: string } | null = null
    const { data: clientByFormatted } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('phone', phoneFormatted)
      .in('status', ['active', 'blocked'])
      .limit(1)
      .maybeSingle()

    client = clientByFormatted

    // Se não encontrou, tenta busca parcial pelo número sem formatação
    if (!client && rawDigits.length >= 8) {
      const last8 = rawDigits.slice(-8)
      const searchPattern = `%${last8.slice(0, 4)}-${last8.slice(4)}%`
      
      const { data: clientByDigits } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('organization_id', organizationId)
        .ilike('phone', searchPattern)
        .in('status', ['active', 'blocked'])
        .limit(1)
        .maybeSingle()

      client = clientByDigits
    }

    if (!client) {
      console.warn('[WEBHOOK_EVOLUTION] cliente não encontrado pelo telefone, salvando como mensagem órfã (client_id: null)', {
        phone: phoneFormatted,
        rawDigits,
        content: content.slice(0, 50),
      })
    }

    const timestamp = msg?.messageTimestamp
    const createdAt = timestamp
      ? new Date(Number(timestamp) * 1000).toISOString()
      : new Date().toISOString()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabaseAdmin.from('messages') as any).insert({
      organization_id: organizationId,
      client_id: client?.id ?? null,
      channel: 'whatsapp',
      direction: 'received',
      content,
      status: 'delivered',
      sent_by: null,
      sender_phone: phoneFormatted,
      created_at: createdAt,
    })

    if (insertError) {
      console.error('[WEBHOOK_EVOLUTION] insert error:', insertError.message, {
        phone: phoneFormatted,
        client_id: client?.id ?? null,
      })
    } else {
      console.log('[WEBHOOK_EVOLUTION] mensagem recebida salva', {
        phone: phoneFormatted,
        client_id: client?.id ?? null,
        content: content.slice(0, 50),
      })

      // Processar confirmação ou cancelamento se encontramos o cliente
      if (client) {
        const cleanContent = content.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const isConfirm = /^(ok|sim|confirmado|confirmar|vou|confirmada|confirmo|si|yes|y)$/.test(cleanContent) || 
                          cleanContent.includes("vou sim") || 
                          cleanContent.includes("confirmar") || 
                          cleanContent.includes("confirmado")
                          
        const isCancel = /^(cancelar|cancela|cancelado|cancelamento|nao|nao vou|desmarcar|nao posso|desmarca)$/.test(cleanContent) || 
                         cleanContent.includes("cancelar") || 
                         cleanContent.includes("desmarcar") || 
                         cleanContent.includes("nao vou")

        if (isConfirm || isCancel) {
          const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
          const in48Hours = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

          const { data: appointments } = await (supabaseAdmin
            .from('appointments') as any)
            .select('id, status, confirmacao_etapa, start_time')
            .eq('client_id', client.id)
            .in('status', ['scheduled'])
            .gte('start_time', threeHoursAgo)
            .lte('start_time', in48Hours)
            .order('start_time', { ascending: true })
            .limit(1)

          const appt = appointments?.[0]
          if (appt) {
            if (isConfirm) {
              let nextStage = 'confirmado'
              if (appt.confirmacao_etapa === '24h_enviado') {
                nextStage = '24h_confirmado'
              }

              await (supabaseAdmin.from('appointments') as any)
                .update({
                  confirmacao_etapa: nextStage,
                  status: 'scheduled'
                })
                .eq('id', appt.id)

              try {
                await enviarMensagem(rawDigits, `Perfeito! Seu agendamento está confirmado. Te esperamos lá! 💈`)
              } catch (err) {
                console.error('[WEBHOOK_EVOLUTION] Error sending confirmation reply:', err)
              }
            } else if (isCancel) {
              await (supabaseAdmin.from('appointments') as any)
                .update({
                  confirmacao_etapa: 'cancelado',
                  status: 'cancelled'
                })
                .eq('id', appt.id)

              try {
                await enviarMensagem(rawDigits, `Agendamento cancelado com sucesso. O horário foi liberado. Caso queira agendar outro horário, estamos à disposição! 🤝`)
              } catch (err) {
                console.error('[WEBHOOK_EVOLUTION] Error sending cancellation reply:', err)
              }
            }
          }
        }
      }
    }
  }

  // ── Atualização de status (lida / entregue) ────────────────────────────────
  if (event === 'messages.update') {
    const updates = Array.isArray(body.data) ? body.data : [body.data]

    const statusMap: Record<string, string> = {
      DELIVERY_ACK: 'delivered',
      READ: 'read',
      PLAYED: 'read',
    }

    for (const update of updates) {
      const messageId = update?.key?.id
      const status = update?.update?.status

      if (!messageId || !status) continue

      const novoStatus = statusMap[status]
      if (!novoStatus) continue

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseAdmin.from('messages') as any)
        .update({ status: novoStatus })
        .eq('whatsapp_message_id', messageId)
    }
  }

  // ── Estado da conexão WhatsApp ─────────────────────────────────────────────
  if (event === 'connection.update') {
    const state = body.data?.state
    console.log('[WEBHOOK_EVOLUTION] connection state changed', { state })
  }

  return NextResponse.json({ ok: true })
}
