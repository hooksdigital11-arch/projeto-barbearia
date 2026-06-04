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

  const insertData: any = {
    organization_id: user.organization_id,
    barber_id: user.id,
    client_id: parsed.data.client_id,
    appointment_id: parsed.data.appointment_id || null,
    item_type: parsed.data.item_type as 'service' | 'product',
    name: parsed.data.name,
    quantity: parsed.data.quantity,
    unit_price_cents: parsed.data.unit_price_cents,
    total_cents,
    paid: false,
  }

  if (parsed.data.inventory_id) {
    insertData.inventory_id = parsed.data.inventory_id
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

  let appointmentId = parsed.data.appointment_id
 
  // 1.3. Se não há agendamento explicitamente fornecido, buscar um agendamento existente (pendente ou em andamento) para este cliente
  if (!appointmentId) {
    try {
      const { data: existingAppts } = await supabaseAdmin
        .from('appointments')
        .select('id, status')
        .eq('organization_id', user.organization_id)
        .eq('client_id', parsed.data.client_id)
        .in('status', ['scheduled', 'in_progress'])
        .order('start_time', { ascending: true })

      if (existingAppts && existingAppts.length > 0) {
        // Priorizar o que estiver 'in_progress', caso contrário o mais antigo 'scheduled'
        const inProgress = existingAppts.find(a => a.status === 'in_progress')
        appointmentId = inProgress ? inProgress.id : existingAppts[0]?.id
      }
    } catch (err) {
      console.error('[CLOSE_COMANDA] Error looking up existing appointment:', err)
    }
  }

  // 1.5. Se não há agendamento pré-existente e há serviços na comanda, criamos um agendamento pontual
  if (!appointmentId) {
    const serviceItems = items.filter(i => i.item_type === 'service')
    const firstServiceItem = serviceItems[0]
    if (firstServiceItem) {
      try {
        // Encontrar o serviço pelo nome na organização
        const { data: serviceObj } = await supabaseAdmin
          .from('services')
          .select('id, duration_minutes')
          .eq('organization_id', user.organization_id)
          .eq('name', firstServiceItem.name)
          .limit(1)
          .maybeSingle()

        if (serviceObj) {
          // Criar agendamento temporário como 'in_progress' para disparar trigger na conclusão
          const totalCents = serviceItems.reduce((acc, i) => acc + i.total_cents, 0)
          const { data: newAppt, error: apptError } = await supabaseAdmin
            .from('appointments')
            .insert({
              organization_id: user.organization_id,
              client_id: parsed.data.client_id,
              barber_id: firstServiceItem.barber_id || user.id,
              service_id: serviceObj.id,
              start_time: now,
              end_time: now,
              duration_minutes: serviceObj.duration_minutes || 30,
              price_cents: totalCents,
              status: 'in_progress'
            })
            .select('id')
            .single()

          if (!apptError && newAppt) {
            appointmentId = newAppt.id
          } else {
            console.error('[CLOSE_COMANDA] Failed to auto-create appointment:', apptError)
          }
        }
      } catch (err) {
        console.error('[CLOSE_COMANDA] Error resolving service for auto-appointment:', err)
      }
    }
  }

  // 1.8. Vincular todos os itens da comanda atual a este agendamento (garante baixa de estoque e auditoria completa)
  if (appointmentId) {
    await supabaseAdmin
      .from('comanda_items')
      .update({ appointment_id: appointmentId })
      .eq('organization_id', user.organization_id)
      .eq('client_id', parsed.data.client_id)
      .eq('paid', false)
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

  // 2.5. Dar baixa no estoque de produtos vendidos e registrar movimentações
  try {
    const productItems = items.filter(i => i.item_type === 'product' && i.inventory_id)
    for (const item of productItems) {
      if (item.inventory_id) {
        // Buscar saldo atual do produto
        const { data: prod } = await supabaseAdmin
          .from('inventory')
          .select('quantity')
          .eq('id', item.inventory_id)
          .eq('organization_id', user.organization_id)
          .single()

        if (prod) {
          const newQty = Math.max(0, (prod.quantity || 0) - item.quantity)
          
          // Atualizar o estoque
          await supabaseAdmin
            .from('inventory')
            .update({ quantity: newQty })
            .eq('id', item.inventory_id)
            .eq('organization_id', user.organization_id)

          // Registrar a venda em inventory_movements para relatórios financeiros
          const client: any = supabaseAdmin
          await client
            .from('inventory_movements')
            .insert({
              organization_id: user.organization_id,
              inventory_id: item.inventory_id,
              type: 'venda',
              quantity: item.quantity,
              unit_price_cents: item.unit_price_cents,
              notes: `Venda automática via comanda do cliente`
            })
        }
      }
    }
  } catch (err) {
    console.error('[CLOSE_COMANDA] Erro ao processar baixa de estoque:', err)
  }

  // 3. Atualizar agendamento para completed — valida que pertence à org antes
  if (appointmentId) {
    const { data: apptBefore } = await supabaseAdmin
      .from('appointments')
      .select('status, client_id')
      .eq('id', appointmentId)
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
        .eq('id', appointmentId)
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
            appointmentId,
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

export async function prepareComandaForAppointment(appointmentId: string) {
  const user = await requireUser()
  if (!['admin', 'barber'].includes(user.role)) return { error: 'Sem permissão' }

  if (!z.string().uuid().safeParse(appointmentId).success) {
    return { error: 'ID de agendamento inválido' }
  }

  try {
    // 1. Buscar o agendamento de forma administrativa para garantir bypass de RLS
    const { data: appt, error: apptError } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        client_id,
        price_cents,
        service:services!appointments_service_id_fkey(id, name, price_cents)
      `)
      .eq('id', appointmentId)
      .eq('organization_id', user.organization_id)
      .single() as any

    if (apptError || !appt) {
      console.error('[PREPARE_COMANDA] Appointment not found:', apptError)
      return { error: 'Agendamento não encontrado' }
    }

    if (!appt.service) {
      return { error: 'Serviço do agendamento não encontrado' }
    }

    // 2. Buscar comanda ativa
    const activeItemsRes = await getActiveComandaAction(appt.client_id)
    if ('error' in activeItemsRes && activeItemsRes.error) {
      return { error: activeItemsRes.error }
    }
    const activeItems = (activeItemsRes.data || []) as ComandaItem[]

    // 3. Verificar se já tem o serviço associado a esse agendamento
    const hasService = activeItems.some(
      (item) => item.appointment_id === appt.id && item.item_type === 'service'
    )

    if (!hasService) {
      const formData = new FormData()
      formData.append('client_id', appt.client_id)
      formData.append('appointment_id', appt.id)
      formData.append('item_type', 'service')
      formData.append('name', appt.service.name || 'Serviço')
      formData.append('quantity', '1')
      formData.append('unit_price_cents', String(appt.price_cents || appt.service.price_cents || 0))

      const addRes = await addComandaItem(formData)
      if (addRes.error) {
        return { error: addRes.error }
      }
    }

    return { success: true, clientId: appt.client_id }
  } catch (err: any) {
    console.error('[PREPARE_COMANDA] Error:', err)
    return { error: err.message || 'Erro ao preparar comanda' }
  }
}


