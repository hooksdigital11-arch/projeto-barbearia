'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState, useMemo, useTransition, useEffect } from 'react'
import { Plus, ArrowCounterClockwise } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import { InventoryStatsCards } from './inventory-stats'
import { LowStockAlert } from './low-stock-alert'
import { InventoryFilters } from './inventory-filters'
import { deleteProduct, reactivateProduct, getSalesByPeriodAction } from '../actions'
import { toast } from 'sonner'
import type { InventoryItem, InventoryStats } from '../types'

const InventoryTable = dynamic(() => import('./inventory-table').then(m => m.InventoryTable), { ssr: false })
const CreateProductModal = dynamic(() => import('./create-product-modal').then(m => m.CreateProductModal), { ssr: false })
const EditProductModal = dynamic(() => import('./edit-product-modal').then(m => m.EditProductModal), { ssr: false })
const StockMovementModal = dynamic(() => import('./stock-movement-modal').then(m => m.StockMovementModal), { ssr: false })

interface Filters {
  category: string
  minQty: string
  maxQty: string
  lowStockOnly: boolean
}

const DEFAULT_FILTERS: Filters = { category: '', minQty: '', maxQty: '', lowStockOnly: false }

interface InventoryPageProps {
  activeItems: InventoryItem[]
  inactiveItems: InventoryItem[]
  stats: InventoryStats
  userRole: 'admin' | 'barber'
}

export function InventoryPage({ activeItems, inactiveItems, stats, userRole }: InventoryPageProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'all' | 'revenda' | 'uso_interno' | 'inactive'>('all')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [period, setPeriod] = useState<'hoje' | 'semana' | 'mes' | 'ano'>('mes')
  const [showCost, setShowCost] = useState(false)
  const [salesData, setSalesData] = useState<Map<string, { qtdVendida: number, faturamento: number }>>(new Map())
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null)
  const [movingProduct, setMovingProduct] = useState<InventoryItem | null>(null)

  const organizationId = activeItems[0]?.organization_id || inactiveItems[0]?.organization_id

  useEffect(() => {
    if (!organizationId) return

    function loadSales() {
      startTransition(async () => {
        const now = new Date()
        let start = new Date()
        const end = new Date()

        if (period === 'hoje') {
          start.setHours(0, 0, 0, 0)
          end.setHours(23, 59, 59, 999)
        } else if (period === 'semana') {
          const day = start.getDay()
          const diff = start.getDate() - day + (day === 0 ? -6 : 1)
          start.setDate(diff)
          start.setHours(0, 0, 0, 0)
        } else if (period === 'mes') {
          start.setDate(1)
          start.setHours(0, 0, 0, 0)
        } else if (period === 'ano') {
          start.setMonth(0, 1)
          start.setHours(0, 0, 0, 0)
        }

        try {
          const result = await getSalesByPeriodAction(start.toISOString(), end.toISOString())
          const dataArray = ('error' in result) ? [] : result
          const newSalesMap = new Map<string, { qtdVendida: number, faturamento: number }>()
          dataArray.forEach(item => {
            newSalesMap.set(item.id, { qtdVendida: item.qtdVendida, faturamento: item.faturamento })
          })
          setSalesData(newSalesMap)
        } catch (err) {
          console.error('Failed to load sales data:', err)
        }
      })
    }

    loadSales()
  }, [period, organizationId, refreshTrigger])

  const sourceItems = activeTab === 'inactive' ? inactiveItems : activeItems

  const filteredItems = useMemo(() => {
    return sourceItems.filter(item => {
      const matchesType = activeTab === 'all' || activeTab === 'inactive' || item.type === activeTab
      const safeName = (item.name || '').toLowerCase()
      const safeCategory = (item.category || '').toLowerCase()
      const safeSupplier = (item.supplier || '').toLowerCase()
      const q = search.toLowerCase()
      const matchesSearch = !q || safeName.includes(q) || safeCategory.includes(q) || safeSupplier.includes(q)
      const matchesCategory = !filters.category || item.category === filters.category
      const matchesMinQty = !filters.minQty || item.quantity >= Number(filters.minQty)
      const matchesMaxQty = !filters.maxQty || item.quantity <= Number(filters.maxQty)
      const matchesLowStock = !filters.lowStockOnly || item.quantity <= (item.min_quantity ?? 5)
      return matchesType && matchesSearch && matchesCategory && matchesMinQty && matchesMaxQty && matchesLowStock
    })
  }, [sourceItems, activeTab, search, filters])

  const handleDelete = (product: InventoryItem) => {
    if (!confirm(`Deseja realmente EXCLUIR PERMANENTEMENTE o produto "${product.name}"?`)) return
    startTransition(async () => {
      const result = await deleteProduct(product.id)
      if (result.success) toast.success('Produto excluído!')
      else toast.error(result.error)
    })
  }

  const handleReactivate = (product: InventoryItem) => {
    startTransition(async () => {
      const result = await reactivateProduct(product.id)
      if (result.success) toast.success(`"${product.name}" reativado!`)
      else toast.error(result.error)
    })
  }

  const handleMovementSuccess = () => {
    router.refresh()
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-12 animate-premium-in py-8">
      <LowStockAlert
        count={stats.lowStock}
        onFilter={() => {
          startTransition(() => {
            setActiveTab('all')
            setFilters({ ...DEFAULT_FILTERS, lowStockOnly: true })
          })
        }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-[32px] font-medium text-text-primary tracking-[-0.02em] uppercase">
            ESTOQUE<span className="text-accent-main">.</span>
          </h1>
          <p className="text-[11px] text-[#333] leading-[1.5] max-w-[460px] font-medium uppercase tracking-wide">
            Controle total de produtos, insumos e movimentações. Gestão inteligente para evitar rupturas e otimizar o fluxo de caixa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {userRole === 'admin' && (
            <button
              onClick={() => setShowCost(!showCost)}
              className={cn(
                "px-[14px] py-[9px] rounded-[8px] border-[0.5px] text-[9px] font-medium uppercase tracking-[0.1em] transition-all flex flex-col items-center justify-center text-center",
                showCost
                  ? "bg-[#1c1c1c] text-text-secondary border-[#2a2a2a]"
                  : "bg-bg-sidebar text-text-nav border-border-main hover:text-[#777]"
              )}
            >
              <span className="leading-tight">{showCost ? 'OCULTAR' : 'VER'}</span>
              <span className="leading-tight">CUSTOS</span>
            </button>
          )}

          {userRole === 'admin' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-[16px] py-[10px] bg-accent-main text-black rounded-[8px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:opacity-90 active:scale-95"
            >
              <Plus size={14} weight="bold" />
              NOVO ITEM
            </button>
          )}
        </div>
      </div>

      <InventoryStatsCards stats={stats} items={activeItems} period={period} salesData={salesData} isLoading={isPending} />

      <div className="space-y-6">
        <InventoryFilters
          activeTab={activeTab}
          setActiveTab={(t) => startTransition(() => { setActiveTab(t); setFilters(DEFAULT_FILTERS) })}
          search={search}
          setSearch={(s) => startTransition(() => setSearch(s))}
          filters={filters}
          setFilters={(f) => startTransition(() => setFilters(f))}
          inactiveCount={inactiveItems.length}
          period={period}
          setPeriod={(p) => startTransition(() => setPeriod(p))}
        />

        {activeTab === 'inactive' ? (
          <InactiveTable
            items={filteredItems}
            onReactivate={handleReactivate}
            canManage={userRole === 'admin'}
            isPending={isPending}
          />
        ) : (
          <InventoryTable
            items={filteredItems}
            onEdit={setEditingProduct}
            onMove={setMovingProduct}
            onDelete={handleDelete}
            canManage={userRole === 'admin'}
            showCost={showCost}
            period={period}
            salesData={salesData}
            isLoading={isPending}
          />
        )}
      </div>

      <CreateProductModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <EditProductModal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} product={editingProduct} />
      <StockMovementModal 
        isOpen={!!movingProduct} 
        onClose={() => setMovingProduct(null)} 
        product={movingProduct} 
        onSuccess={handleMovementSuccess}
      />
    </div>
  )
}

function InactiveTable({
  items, onReactivate, canManage, isPending
}: {
  items: InventoryItem[]
  onReactivate: (item: InventoryItem) => void
  canManage: boolean
  isPending: boolean
}) {
  if (items.length === 0) {
    return (
      <div className="bg-bg-sidebar border-[0.5px] border-dashed border-border-main rounded-[10px] p-[60px] text-center">
        <ArrowCounterClockwise size={32} weight="regular" className="text-[#1e1e1e] mx-auto mb-4" />
        <p className="text-[10px] font-medium text-[#222] tracking-[0.1em] uppercase">Nenhum produto inativo</p>
      </div>
    )
  }

  return (
    <div className="space-y-[4px]">
      <div className="px-[18px] py-1">
        <span className="text-[9px] font-medium uppercase tracking-widest text-[#333]">
          {items.length} PRODUTO{items.length > 1 ? 'S' : ''} DESATIVADO{items.length > 1 ? 'S' : ''}
        </span>
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] opacity-40 hover:opacity-100 transition-all"
        >
          {/* Mobile layout */}
          <div className="md:hidden p-[14px] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-text-secondary uppercase tracking-tight line-through truncate">{item.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-[#2e2e2e] font-medium uppercase tracking-wider">{item.category}</span>
                <span className="text-[9px] px-2 py-0.5 rounded-[4px] bg-bg-surface text-[#333] font-medium uppercase">
                  {item.type === 'revenda' ? 'Revenda' : 'Interno'}
                </span>
                <span className="text-[11px] font-medium text-[#444]">{item.quantity}</span>
              </div>
            </div>
            {canManage && (
              <button
                disabled={isPending}
                onClick={() => onReactivate(item)}
                className="flex items-center gap-1.5 px-[10px] py-[6px] bg-bg-sidebar border border-border-main rounded-[6px] text-[9px] font-medium text-[#444] tracking-[0.07em] uppercase hover:text-[#666] hover:border-[#333] transition-all disabled:opacity-20 shrink-0"
              >
                <ArrowCounterClockwise size={12} weight="bold" />
                Reativar
              </button>
            )}
          </div>

          {/* Desktop layout */}
          <div className="hidden md:grid grid-cols-[2fr_100px_70px_1fr_100px] gap-[12px] items-center py-[13px] px-[18px]">
            <div>
              <p className="text-[12px] font-medium text-text-secondary uppercase tracking-tight line-through">{item.name}</p>
              <span className="text-[9px] text-[#2e2e2e] font-medium uppercase tracking-wider">{item.category}</span>
            </div>
            <div className="text-center">
              <span className="text-[9px] px-2 py-0.5 rounded-[4px] bg-bg-surface text-[#333] font-medium uppercase tracking-wider">
                {item.type === 'revenda' ? 'Revenda' : 'Uso Interno'}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[11px] font-medium text-[#444]">{item.quantity}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-[#333] uppercase">{item.supplier || '—'}</span>
            </div>
            {canManage && (
              <div className="flex justify-end">
                <button
                  disabled={isPending}
                  onClick={() => onReactivate(item)}
                  className="flex items-center gap-1.5 px-[12px] py-[6px] bg-bg-sidebar border border-border-main rounded-[6px] text-[9px] font-medium text-[#444] tracking-[0.07em] uppercase hover:text-[#666] hover:border-[#333] transition-all disabled:opacity-20"
                >
                  <ArrowCounterClockwise size={12} weight="bold" />
                  Reativar
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
