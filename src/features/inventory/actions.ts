'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/require-auth'
import {
  createProductSchema,
  updateProductSchema,
  moveStockSchema,
} from './schemas'

export async function createProduct(formData: FormData) {
  const user = await requireUser()
  
  const parsed = createProductSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    category: formData.get('category'),
    description: formData.get('description'),
    quantity: Number(formData.get('quantity')),
    min_quantity: Number(formData.get('min_quantity')),
    cost_cents: formData.get('cost_cents')
      ? Math.round(Number(formData.get('cost_cents')) * 100)
      : null,
    price_cents: formData.get('price_cents')
      ? Math.round(Number(formData.get('price_cents')) * 100)
      : null,
    supplier: formData.get('supplier'),
    supplier_phone: formData.get('supplier_phone'),
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos', issues: parsed.error.flatten() }
  }

  const { error } = await supabaseAdmin.from('inventory').insert({
    ...parsed.data,
    organization_id: user.organization_id,
    active: true,
  })

  if (error) {
    console.error('[CREATE_PRODUCT]', error.message)
    return { error: 'Erro ao criar produto' }
  }

  revalidatePath('/admin/inventory')
  revalidatePath('/barber/inventory')
  return { success: true }
}

export async function updateProduct(productId: string, formData: FormData) {
  const user = await requireUser()
  
  const parsed = updateProductSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    category: formData.get('category'),
    description: formData.get('description'),
    quantity: Number(formData.get('quantity')),
    min_quantity: Number(formData.get('min_quantity')),
    cost_cents: formData.get('cost_cents')
      ? Math.round(Number(formData.get('cost_cents')) * 100)
      : null,
    price_cents: formData.get('price_cents')
      ? Math.round(Number(formData.get('price_cents')) * 100)
      : null,
    supplier: formData.get('supplier'),
    supplier_phone: formData.get('supplier_phone'),
    active: formData.get('active') === 'true',
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos', issues: parsed.error.flatten() }
  }

  const { error } = await supabaseAdmin
    .from('inventory')
    .update(parsed.data)
    .eq('id', productId)
    .eq('organization_id', user.organization_id)

  if (error) {
    console.error('[UPDATE_PRODUCT]', error.message)
    return { error: 'Erro ao atualizar produto' }
  }

  revalidatePath('/admin/inventory')
  revalidatePath('/barber/inventory')
  return { success: true }
}

export async function moveStock(productId: string, formData: FormData) {
  const user = await requireUser()
  
  const parsed = moveStockSchema.safeParse({
    direction: formData.get('direction'),
    quantity: Number(formData.get('quantity')),
    reason: formData.get('reason'),
    observation: formData.get('observation'),
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos' }
  }

  // Buscar produto atual
  const { data: product } = await supabaseAdmin
    .from('inventory')
    .select('quantity, type, price_cents')
    .eq('id', productId)
    .eq('organization_id', user.organization_id)
    .single()

  if (!product) return { error: 'Produto não encontrado' }

  const newQuantity =
    parsed.data.direction === 'in'
      ? product.quantity + parsed.data.quantity
      : product.quantity - parsed.data.quantity

  if (newQuantity < 0) {
    return { error: 'Estoque insuficiente para essa saída' }
  }

  // 1. Update Inventory Quantity
  const { error: updateError } = await supabaseAdmin
    .from('inventory')
    .update({ quantity: newQuantity })
    .eq('id', productId)
    .eq('organization_id', user.organization_id)

  if (updateError) {
    console.error('[MOVE_STOCK_UPDATE]', updateError.message)
    return { error: 'Erro ao movimentar estoque' }
  }

  // 2. Insert into inventory_movements
  const type = parsed.data.direction === 'out'
    ? (product.type === 'revenda' ? 'venda' : 'uso_interno')
    : (parsed.data.reason === 'Compra' ? 'entrada' : 'ajuste')

  const unit_price_cents = (parsed.data.direction === 'out' && product.type === 'revenda') 
    ? product.price_cents 
    : null

  const { error: insertError } = await (supabaseAdmin as any)
    .from('inventory_movements')
    .insert({
      organization_id: user.organization_id,
      inventory_id: productId,
      type,
      quantity: parsed.data.quantity,
      unit_price_cents,
      notes: parsed.data.observation
    })

  if (insertError) {
    console.error('[MOVE_STOCK_INSERT]', insertError.message)
    // We don't rollback the inventory update here, but we log the error. 
    // In a robust system, this should be an RPC transaction.
  }

  revalidatePath('/admin/inventory')
  revalidatePath('/barber/inventory')
  return { success: true, newQuantity }
}

export async function deleteProduct(productId: string) {
  const user = await requireUser()
  
  const { error } = await supabaseAdmin
    .from('inventory')
    .delete()
    .eq('id', productId)
    .eq('organization_id', user.organization_id)

  if (error) {
    console.error('[DELETE_PRODUCT]', error.message)
    return { error: 'Erro ao excluir produto permanentemente' }
  }

  revalidatePath('/admin/inventory')
  revalidatePath('/barber/inventory')
  return { success: true }
}

export async function reactivateProduct(productId: string) {
  const user = await requireUser()
  
  const { error } = await supabaseAdmin
    .from('inventory')
    .update({ active: true })
    .eq('id', productId)
    .eq('organization_id', user.organization_id)

  if (error) {
    console.error('[REACTIVATE_PRODUCT]', error.message)
    return { error: 'Erro ao reativar produto' }
  }

  revalidatePath('/admin/inventory')
  revalidatePath('/barber/inventory')
  return { success: true }
}

export async function getSalesByPeriodAction(startDateStr: string, endDateStr: string) {
  const user = await requireUser()
  
  const { data, error } = await (supabaseAdmin as any)
    .from('inventory_movements')
    .select('inventory_id, quantity, unit_price_cents')
    .eq('organization_id', user.organization_id)
    .eq('type', 'venda')
    .gte('created_at', startDateStr)
    .lte('created_at', endDateStr)

  if (error) {
    console.error('[fetchSalesByPeriodAction]', error.message)
    return []
  }

  const salesMap = new Map<string, { qtdVendida: number, faturamento: number }>()

  data.forEach((movement: any) => {
    const id = movement.inventory_id
    const qty = movement.quantity || 0
    const price = movement.unit_price_cents || 0
    const revenue = qty * price

    const existing = salesMap.get(id) || { qtdVendida: 0, faturamento: 0 }
    salesMap.set(id, {
      qtdVendida: existing.qtdVendida + qty,
      faturamento: existing.faturamento + revenue
    })
  })

  // Convert map to array to allow serialization over network
  return Array.from(salesMap.entries()).map(([id, stats]) => ({
    id,
    ...stats
  }))
}
