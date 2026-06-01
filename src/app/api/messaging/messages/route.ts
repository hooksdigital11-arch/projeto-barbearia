import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('clientId')

  if (!clientId || !z.string().uuid().safeParse(clientId).success) {
    return NextResponse.json({ error: 'clientId inválido' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 403 })

  if (!['admin', 'barber'].includes((profile as any).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Valida que o cliente pertence à org do usuário autenticado
  const { data: clientRecord } = await supabaseAdmin
    .from('clients')
    .select('id, phone')
    .eq('id', clientId)
    .eq('organization_id', (profile as any).organization_id)
    .maybeSingle()

  if (!clientRecord) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  // Busca mensagens pelo client_id (mensagens novas) OU pelo telefone do cliente
  // (mensagens antigas que chegaram antes do client_id ser resolvido)
  const orgId = (profile as any).organization_id

  // Mensagens vinculadas diretamente ao cliente
  const { data: byClientId, error: err1 } = await supabaseAdmin
    .from('messages')
    .select('id, client_id, direction, content, template_used, status, sent_by, created_at')
    .eq('organization_id', orgId)
    .eq('client_id', clientId)
    .order('created_at', { ascending: true })
    .limit(100)

  if (err1) {
    return NextResponse.json({ error: err1.message }, { status: 500 })
  }

  // Deduplicação por ID para evitar duplicatas se algum registro apareça nas duas buscas
  const seen = new Set<string>((byClientId || []).map(m => m.id))
  const all = [...(byClientId || [])]

  // Se o cliente tem telefone, busca também mensagens com client_id nulo (recebidas pelo webhook
  // antes do phone matching ser corrigido) — filtra pelo sender_phone
  if ((clientRecord as any).phone) {
    const rawPhoneDigits = ((clientRecord as any).phone as string).replace(/\D/g, '')
    // Remove o DDI se houver, depois formata no padrão (XX) XXXXX-XXXX
    const cleanDigits = rawPhoneDigits.replace(/^55/, '')
    const clientPhone = cleanDigits.length === 11
      ? `(${cleanDigits.slice(0, 2)}) ${cleanDigits.slice(2, 7)}-${cleanDigits.slice(7)}`
      : cleanDigits.length === 10
      ? `(${cleanDigits.slice(0, 2)}) ${cleanDigits.slice(2, 6)}-${cleanDigits.slice(6)}`
      : (clientRecord as any).phone as string

    const { data: byPhone } = await (supabaseAdmin.from('messages') as any)
      .select('id, client_id, direction, content, template_used, status, sent_by, sender_phone, created_at')
      .eq('organization_id', orgId)
      .is('client_id', null)
      .eq('direction', 'received')
      .eq('sender_phone', clientPhone)
      .order('created_at', { ascending: true })
      .limit(100)

    // Inclui apenas as que ainda não foram encontradas pelo client_id
    for (const msg of byPhone || []) {
      if (!seen.has(msg.id)) {
        all.push(msg)
        seen.add(msg.id)
      }
    }
  }

  // Ordena o resultado final por data
  all.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  return NextResponse.json(all)
}
