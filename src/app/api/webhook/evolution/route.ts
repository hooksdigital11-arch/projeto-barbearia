import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'

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

export async function POST(req: NextRequest) {
  if (!isValidSecret(req.headers.get('x-webhook-secret'))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ ok: true })

  if (body.event === 'messages.upsert') {
    const msg = body.data

    // Skip messages we sent
    if (msg?.key?.fromMe) {
      return NextResponse.json({ ok: true })
    }

    const jid: string = msg?.key?.remoteJid ?? ''
    const rawPhone = jid.replace('@s.whatsapp.net', '').replace(/^55/, '')
    const content: string =
      msg?.message?.conversation ??
      msg?.message?.extendedTextMessage?.text ??
      ''

    if (!rawPhone || !content) {
      return NextResponse.json({ ok: true })
    }

    const organizationId = process.env.EVOLUTION_ORGANIZATION_ID
    if (!organizationId) {
      console.error('[WEBHOOK_EVOLUTION] EVOLUTION_ORGANIZATION_ID not set')
      return NextResponse.json({ ok: true })
    }

    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('phone', rawPhone)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    const timestamp = msg?.messageTimestamp
    const createdAt = timestamp
      ? new Date(Number(timestamp) * 1000).toISOString()
      : new Date().toISOString()

    await (supabaseAdmin.from('messages') as any).insert({
      organization_id: organizationId,
      client_id: client?.id ?? null,
      channel: 'whatsapp',
      direction: 'received',
      content,
      status: 'delivered',
      sent_by: null,
      created_at: createdAt,
    })
  }

  return NextResponse.json({ ok: true })
}
