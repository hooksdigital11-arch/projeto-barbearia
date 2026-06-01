'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import { addItemSchema, closeComandaSchema } from './schemas'
import { addStampAfterAppointment } from '@/features/loyalty/actions'
import { ComandaItem } from './types'
import { getActiveComanda } from './queries'


// Adicionar item (serviço ou produto)
export async function addComandaItem(formData: FormData) {
  const user = await requireUser()
  if (!['admin', 'barber'].includes(user.role)) return { error: 'Sem permissão' }

  const parsed = addItemSchema.safeParse({
    client_id: formData.get('client_id'),
    appointment_id: formData.get('appointment_id') || null,
    item_type: formData.get('item_type'),
    name: formData.get('name'),
    quantity: Number(formData.get('quantity') || 1),
    unit_price_cents: Number(formData.get('unit_price_cents')),
    inventory_id: formData.get('inventory_id') || null,
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos', issues: parsed.error.flatten() }
  }

  const total_cents = parsed.data.unit_price_cents * parsed.data.quantity

  const insertData = {
    organization_id: user.organization_id,
    barber_id: user.id,
    client_id: parsed.data.client_id,
    appointment_id: parsed.data.appointment_id || null,
    inventory_id: parsed.data.inventory_id || null,
    item_type: parsed.data.item_type as 'service' | 'product',
    name: parsed.data.name,
    quantity: parsed.data.quantity,
    unit_price_cents: parsed.data.unit_price_cents,
    total_cents,
    paid: false,
  }

  const { error } = await supabaseAdmin.from('comanda_items').insert(insertData)

  if (error) {
    console.error('Error adding comanda item:', error)
    return { error: 'Erro ao adicionar item' }
  }

  revalidatePath('/barber/comanda')
  revalidatePath('/admin/comanda')
  return { success: true }
}

// Remover item
export async function removeComandaItem(itemId: string) {
  if (!z.string().uuid().safeParse(itemId).success) return { error: 'ID inválido' }
  const user = await requireUser()
  if (!['admin', 'barber'].includes(user.role)) return { error: 'Sem permissão' }

  const { error } = await supabaseAdmin
    .from('comanda_items')
    .delete()
    .eq('id', itemId)
    .eq('organization_id', user.organization_id)
    .eq('paid', false)

  if (error) return { error: 'Erro ao remover item' }

  revalidatePath('/barber/comanda')
  return { success: true }
}

// Fechar comanda (processar pagamento)
export async function closeComanda(formData: FormData) {
  const user = await requireUser()
  if (!['admin', 'barber'].includes(user.role)) return { error: 'Sem permissão' }

  const parsed = closeComandaSchema.safeParse({
    client_id: formData.get('client_id'),
    appointment_id: formData.get('appointment_id') || null,
    payment_method: formData.get('payment_method'),
    discount_cents: Number(formData.get('discount_cents') || 0),
  })

  if (!parsed.success) return { error: 'Dados inválidos' }

  const now = new Date().toISOString()

  // 1. Buscar todos os itens não pagos do cliente
  const { data: items } = await supabaseAdmin
    .from('comanda_items')
    .select('*')
    .eq('organization_id', user.organization_id)
    .eq('client_id', parsed.data.client_id)
    .eq('paid', false) as { data: ComandaItem[] | null }

  if (!items || items.length === 0) {
    return { error: 'Nenhum item na comanda' }
  }

  const updateData = {
    paid: true,
    paid_at: now,
    payment_method: parsed.data.payment_method as 'cash' | 'pix' | 'credit_card' | 'debit_card',
  }

  // 2. Marcar todos como pagos
  const { error: payError } = await supabaseAdmin
    .from('comanda_items')
    .update(updateData)
    .eq('organization_id', user.organization_id)
    .eq('client_id', parsed.data.client_id)
    .eq('paid', false)

  if (payError) return { error: 'Erro ao processar pagamento' }

  // 3. Atualizar agendamento para completed — valida que pertence à org antes
  if (parsed.data.appointment_id) {
    const { data: apptBefore } = await supabaseAdmin
      .from('appointments')
      .select('status, client_id')
      .eq('id', parsed.data.appointment_id)
      .eq('organization_id', user.organization_id)
      .single() as { data: { status: string; client_id: string } | null }

    // Garante que o agendamento pertence à org e ao cliente informado
    if (apptBefore && apptBefore.client_id !== parsed.data.client_id) {
      return { error: 'Agendamento não pertence a este cliente' }
    }

    if (apptBefore) {
      await supabaseAdmin
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', parsed.data.appointment_id)
        .eq('organization_id', user.organization_id)

      if (apptBefore.status !== 'completed') {
        const totalCents = items.reduce((sum: number, i: ComandaItem) => sum + i.total_cents, 0) - (parsed.data.discount_cents || 0)
        
        type ClientStatsRow = {
          total_visits: number | null
          total_spent_cents: number | null
        }
        const { data: clientObj } = await supabaseAdmin
          .from('clients')
          .select('total_visits, total_spent_cents')
          .eq('id', parsed.data.client_id)
          .eq('organization_id', user.organization_id)
          .single() as { data: ClientStatsRow | null }

        if (clientObj) {
          await supabaseAdmin
            .from('clients')
            .update({
              total_visits: (clientObj.total_visits || 0) + 1,
              total_spent_cents: (clientObj.total_spent_cents || 0) + totalCents,
              last_visit_at: new Date().toISOString()
            })
            .eq('id', parsed.data.client_id)
        }

        // Adicionar carimbo de fidelidade automaticamente após atendimento pago
        try {
          await addStampAfterAppointment(
            user.organization_id,
            parsed.data.client_id,
            parsed.data.appointment_id,
            totalCents
          )
        } catch (err) {
          console.error('[CLOSE_COMANDA] Falha ao adicionar carimbo de fidelidade:', err)
        }
      }
    }
  }

  // 4. Gerar número do recibo
  const receiptNumber = `#${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`

  revalidatePath('/barber/comanda')
  revalidatePath('/admin/comanda')
  revalidatePath('/admin')
  revalidatePath('/admin/reports')

  const totalCents = items.reduce((sum: number, i: ComandaItem) => sum + i.total_cents, 0)
    - (parsed.data.discount_cents || 0)

  return {
    success: true,
    receiptNumber,
    items,
    totalCents,
    paymentMethod: parsed.data.payment_method,
  }
}

export async function getActiveComandaAction(clientId: string) {
  const user = await requireUser()
  if (!z.string().uuid().safeParse(clientId).success) return { error: 'ID de cliente inválido' }

  try {
    const data = await getActiveComanda(clientId)
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching active comanda:', error)
    return { error: 'Erro ao buscar comanda ativa' }
  }
}

export async function getServicesAction() {
  await requireUser()
  try {
    const { getServices } = await import('@/features/appointment/queries')
    const services = await getServices()
    return { success: true, data: services }
  } catch (err: any) {
    console.error('[GET_SERVICES_ACTION] error:', err)
    return { error: err.message || 'Erro ao carregar serviços' }
  }
}

export async function getProductsAction() {
  await requireUser()
  try {
    const { getInventory } = await import('@/features/inventory/queries')
    const products = await getInventory(true)
    return { success: true, data: products }
  } catch (err: any) {
    console.error('[GET_PRODUCTS_ACTION] error:', err)
    return { error: err.message || 'Erro ao carregar produtos' }
  }
}

export async function getClientNameAction(clientId: string) {
  await requireUser()
  if (!z.string().uuid().safeParse(clientId).success) return { error: 'ID de cliente inválido' }
  try {
    const { supabaseAdmin } = await import('@/lib/supabase/admin')
    const { data } = await supabaseAdmin
      .from('clients')
      .select('full_name')
      .eq('id', clientId)
      .single()
    return { success: true, name: data?.full_name || 'Desconhecido' }
  } catch (err: any) {
    console.error('[GET_CLIENT_NAME_ACTION] error:', err)
    return { error: err.message || 'Erro ao carregar nome do cliente' }
  }
}

