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
    .select('id')
    .eq('id', clientId)
    .eq('organization_id', (profile as any).organization_id)
    .maybeSingle()

  if (!clientRecord) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  const { data, error } = await supabaseAdmin
    .from('messages')
    .select(`
      id, client_id, direction, content, template_used,
      status, sent_by, created_at
    `)
    .eq('organization_id', (profile as any).organization_id)
    .eq('client_id', clientId)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}
