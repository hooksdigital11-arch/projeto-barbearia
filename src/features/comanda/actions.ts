'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/require-auth'
import { addItemSchema, closeComandaSchema } from './schemas'
import { addStampAfterAppointment } from '@/features/loyalty/actions'
import { ComandaItem } from './types'

// Adicionar item (serviço ou produto)
export async function addComandaItem(formData: FormData) {
  const user = await requireUser()
  const supabase = await createClient()

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

  const { error } = await (supabase.from('comanda_items') as any).insert(insertData)

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
  const user = await requireUser()
  const supabase = await createClient()

  const { error } = await supabase
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
  const supabase = await createClient()

  const parsed = closeComandaSchema.safeParse({
    client_id: formData.get('client_id'),
    appointment_id: formData.get('appointment_id') || null,
    payment_method: formData.get('payment_method'),
    discount_cents: Number(formData.get('discount_cents') || 0),
  })

  if (!parsed.success) return { error: 'Dados inválidos' }

  const now = new Date().toISOString()

  // 1. Buscar todos os itens não pagos do cliente
  const { data: items } = await (supabase
    .from('comanda_items') as any)
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
  const { error: payError } = await (supabase
    .from('comanda_items') as any)
    .update(updateData)
    .eq('organization_id', user.organization_id)
    .eq('client_id', parsed.data.client_id)
    .eq('paid', false)

  if (payError) return { error: 'Erro ao processar pagamento' }

  // 3. Atualizar agendamento para completed (Isso dispara a Trigger de Fidelidade e Estoque)
  if (parsed.data.appointment_id) {
    const { data: apptBefore } = await supabase
      .from('appointments')
      .select('status')
      .eq('id', parsed.data.appointment_id)
      .single()

    await (supabase
      .from('appointments') as any)
      .update({ status: 'completed' })
      .eq('id', parsed.data.appointment_id)
      .eq('organization_id', user.organization_id)

    if (apptBefore?.status !== 'completed') {
      const totalCents = items.reduce((sum: number, i: ComandaItem) => sum + i.total_cents, 0) - (parsed.data.discount_cents || 0)
      const { data: client } = await supabase
        .from('clients')
        .select('total_visits, total_spent_cents')
        .eq('id', parsed.data.client_id)
        .single()

      if (client) {
        await supabase
          .from('clients')
          .update({
            total_visits: (client.total_visits || 0) + 1,
            total_spent_cents: (client.total_spent_cents || 0) + totalCents,
            last_visit_at: new Date().toISOString()
          })
          .eq('id', parsed.data.client_id)
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
