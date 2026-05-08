'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo, useTransition, useEffect } from 'react'
import { Plus, ArrowCounterClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { InventoryStatsCards } from './inventory-stats'
import { LowStockAlert } from './low-stock-alert'
import { InventoryFilters } from './inventory-filters'
import { InventoryTable } from './inventory-table'
import { CreateProductModal } from './create-product-modal'
import { EditProductModal } from './edit-product-modal'
import { StockMovementModal } from './stock-movement-modal'
import { deleteProduct, reactivateProduct, getSalesByPeriodAction } from '../actions'
import { toast } from 'sonner'
import type { InventoryItem, InventoryStats } from '../types'

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
  const [activeTab, setActiveTab] = useState<'all' | 'revenda' | 'uso_interno' | 'inactive'>('all')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [period, setPeriod] = useState<'hoje' | 'semana' | 'mes' | 'ano'>('mes')
  const [salesData, setSalesData] = useState<Map<string, { qtdVendida: number, faturamento: number }>>(new Map())
  const [isLoadingSales, setIsLoadingSales] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null)
  const [movingProduct, setMovingProduct] = useState<InventoryItem | null>(null)

  const [isPending, startTransition] = useTransition()

  const organizationId = activeItems[0]?.organization_id || inactiveItems[0]?.organization_id

  useEffect(() => {
    if (!organizationId) return

    async function loadSales() {
      setIsLoadingSales(true)
      const now = new Date()
      let start = new Date()
      const end = new Date()

      if (period === 'hoje') {
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
      } else if (period === 'semana') {
        // Segunda-feira desta semana
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
        const dataArray = await getSalesByPeriodAction(start.toISOString(), end.toISOString())
        const newSalesMap = new Map<string, { qtdVendida: number, faturamento: number }>()
        dataArray.forEach(item => {
          newSalesMap.set(item.id, { qtdVendida: item.qtdVendida, faturamento: item.faturamento })
        })
        setSalesData(newSalesMap)
      } catch (err) {
        console.error('Failed to load sales data:', err)
      } finally {
        setIsLoadingSales(false)
      }
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
    if (!confirm(`Deseja realmente EXCLUIR PERMANENTEMENTE o produto "${product.name}"? Esta ação não pode ser desfeita.`)) return
    startTransition(async () => {
      const result = await deleteProduct(product.id)
      if (result.success) toast.success('Produto excluído permanentemente.')
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <LowStockAlert
        count={stats.lowStock}
        onFilter={() => {
          setActiveTab('all')
          setFilters({ ...DEFAULT_FILTERS, lowStockOnly: true })
        }}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-syne text-white tracking-tight">Estoque</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerenciamento completo de suprimentos e revenda.</p>
        </div>
        {userRole === 'admin' && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-accent-cyan hover:bg-cyan-400 text-black font-bold gap-2 rounded-2xl px-8 py-7 text-base shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20} weight="bold" />
            Novo Produto
          </Button>
        )}
      </div>

      <InventoryStatsCards stats={stats} items={activeItems} period={period} salesData={salesData} isLoading={isLoadingSales} />

      <div className="space-y-6">
        <InventoryFilters
          activeTab={activeTab}
          setActiveTab={(t) => { setActiveTab(t); setFilters(DEFAULT_FILTERS) }}
          search={search}
          setSearch={setSearch}
          filters={filters}
          setFilters={setFilters}
          inactiveCount={inactiveItems.length}
          period={period}
          setPeriod={setPeriod}
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
            showCost={userRole === 'admin'}
            period={period}
            salesData={salesData}
            isLoading={isLoadingSales}
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

// Tabela de inativos inline
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
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-3xl bg-white/5 flex items-center justify-center mx-auto text-muted-foreground/30">
          <ArrowCounterClockwise size={28} weight="duotone" />
        </div>
        <div>
          <p className="text-white font-bold">Nenhum produto inativo</p>
          <p className="text-sm text-muted-foreground">Produtos desativados aparecerão aqui.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
      <div className="px-6 py-4 bg-red-500/5 border-b border-red-500/10 flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-red-400">
          {items.length} produto{items.length > 1 ? 's' : ''} desativado{items.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Produto</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Estoque</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fornecedor</th>
              {canManage && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((item) => (
              <tr key={item.id} className="opacity-60 hover:opacity-100 transition-all group">
                <td className="px-6 py-5">
                  <div>
                    <p className="font-bold text-white text-sm line-through decoration-red-500/50">{item.name}</p>
                    <span className="text-[10px] text-muted-foreground uppercase">{item.category}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-muted-foreground">
                    {item.type === 'revenda' ? 'Revenda' : 'Uso Interno'}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="text-sm text-muted-foreground">{item.quantity}</span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm text-muted-foreground">{item.supplier || '—'}</span>
                </td>
                {canManage && (
                  <td className="px-6 py-5 text-right">
                    <button
                      disabled={isPending}
                      onClick={() => onReactivate(item)}
                      className="flex items-center gap-1.5 ml-auto px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-50"
                    >
                      <ArrowCounterClockwise size={14} weight="bold" />
                      Reativar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
