'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ComandaHistoryTable } from './comanda-history-table'
import { ComandaItemWithRelations } from '../types'
import {
  MagnifyingGlass,
  TrendUp,
  Users,
  Wallet,
  Clock,
  FadersHorizontal,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'

type Period = 'today' | 'week' | 'month'

interface ComandaPageAdminProps {
  history: ComandaItemWithRelations[]
  stats: {
    today: number
    open: number
    revenue: number
    avgTicket: number
  }
  initialPeriod?: Period
}

const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: 'HOJE' },
  { id: 'week', label: 'SEMANA' },
  { id: 'month', label: 'MÊS' },
]

export function ComandaPageAdmin({
  history,
  stats,
  initialPeriod = 'today',
}: ComandaPageAdminProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState('')
  const [period, setPeriod] = useState<Period>(initialPeriod)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBarber, setSelectedBarber] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isPending, startTransition] = useTransition()

  const changePeriod = (newPeriod: Period) => {
    setPeriod(newPeriod)
    startTransition(() => {
      router.push(`${pathname}?period=${newPeriod}`)
    })
  }

  // Get unique barbers from history for filter dropdown
  const uniqueBarbers = Array.from(
    new Map(
      history
        .filter(item => item.barber)
        .map(item => [item.barber_id, { id: item.barber_id, name: item.barber?.full_name }])
    ).values()
  )

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barber?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesBarber = !selectedBarber || item.barber_id === selectedBarber
    const matchesMethod = !selectedMethod || item.payment_method === selectedMethod
    const matchesStatus = !selectedStatus || (selectedStatus === 'paid' ? item.paid : !item.paid)

    return matchesSearch && matchesBarber && matchesMethod && matchesStatus
  })

  const formatMoney = (cents: number) => {
    const val = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    return (
      <span className="flex items-baseline">
        <span className="text-[12px] text-text-nav font-medium mr-1 align-super uppercase">R$</span>
        <span className="text-[20px] font-medium text-text-primary">{val}</span>
      </span>
    )
  }

  return (
    <div className={cn('animate-premium-in py-8 space-y-12', isPending && 'opacity-60 pointer-events-none')}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-[32px] font-medium text-text-primary tracking-[-0.02em] uppercase">
          COMANDAS<span className="text-accent-main">.</span>
        </h1>
        <p className="text-[11px] text-[#333] leading-[1.5] max-w-[420px] font-medium uppercase tracking-wide">
          Gestão financeira de atendimentos. Monitore faturamento, ticket médio e fluxo de fechamento de contas com precisão absoluta.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { label: 'COMANDAS HOJE', value: stats.today, icon: Users, desc: 'Finalizadas hoje' },
          { label: 'EM ABERTO', value: stats.open, icon: Clock, desc: 'Aguardando fechamento' },
          { label: 'RECEITA HOJE', value: formatMoney(stats.revenue), icon: Wallet, desc: 'Total processado', isMoney: true },
          { label: 'TICKET MÉDIO', value: formatMoney(stats.avgTicket), icon: TrendUp, desc: 'Média por atendimento', isMoney: true }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px] px-[18px] flex flex-col justify-between h-[110px]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-medium text-[#383838] tracking-[0.12em] uppercase">{kpi.label}</span>
              <kpi.icon size={14} weight="regular" className="text-accent-main opacity-35" />
            </div>
            <div className="space-y-1">
              <div className="text-text-primary font-medium">
                {typeof kpi.value === 'number' ? (
                  <span className="text-[26px]">{kpi.value}</span>
                ) : (
                  kpi.value
                )}
              </div>
              <p className="text-[8px] text-[#2a2a2a] tracking-[0.07em] font-medium uppercase">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[3px] w-fit shrink-0">
          {PERIODS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => changePeriod(id)}
              className={cn(
                'px-4 md:px-8 py-2 rounded-[6px] text-[10px] font-medium uppercase tracking-[0.05em] transition-all duration-300',
                period === id
                  ? 'bg-[#1c1c1c] text-text-secondary'
                  : 'text-[#333] hover:text-text-nav'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-2 flex-1 md:max-w-[320px]">
          <div className="relative group bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] flex items-center px-[14px] flex-1 min-w-0">
            <MagnifyingGlass size={14} className="text-[#2e2e2e] shrink-0" />
            <input
              type="text"
              placeholder="BUSCAR CLIENTE OU BARBEIRO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none py-[9px] pl-[10px] text-[11px] text-text-secondary placeholder:text-[#2e2e2e] w-full font-medium min-w-0"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "w-[36px] h-[36px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] flex items-center justify-center transition-all",
                (selectedBarber || selectedMethod || selectedStatus || showFilters)
                  ? "text-accent-main border-accent-main/20"
                  : "text-[#3d3d3d] hover:text-text-nav"
              )}
            >
              <FadersHorizontal size={18} weight="regular" />
            </button>

            {showFilters && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFilters(false)} />
                <div className="absolute right-0 top-[42px] min-w-[220px] bg-bg-surface border-[0.5px] border-[#222] rounded-[10px] p-4 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.1em]">Barbeiro</label>
                    <select
                      value={selectedBarber}
                      onChange={(e) => setSelectedBarber(e.target.value)}
                      className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[6px] px-3 py-2 text-[11px] text-text-secondary outline-none appearance-none"
                    >
                      <option value="">TODOS OS BARBEIROS</option>
                      {uniqueBarbers.map(b => (
                        <option key={b.id} value={b.id}>{b.name?.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.1em]">Pagamento</label>
                    <select
                      value={selectedMethod}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[6px] px-3 py-2 text-[11px] text-text-secondary outline-none appearance-none"
                    >
                      <option value="">TODOS OS MÉTODOS</option>
                      <option value="cash">DINHEIRO</option>
                      <option value="pix">PIX</option>
                      <option value="credit_card">CRÉDITO</option>
                      <option value="debit_card">DÉBITO</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.1em]">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[6px] px-3 py-2 text-[11px] text-text-secondary outline-none appearance-none"
                    >
                      <option value="">TODOS OS STATUS</option>
                      <option value="paid">PAGO</option>
                      <option value="open">ABERTA</option>
                    </select>
                  </div>

                  {(selectedBarber || selectedMethod || selectedStatus) && (
                    <button
                      onClick={() => {
                        setSelectedBarber('')
                        setSelectedMethod('')
                        setSelectedStatus('')
                      }}
                      className="w-full pt-2 border-t border-border-main text-[9px] font-medium text-[#c04040] uppercase tracking-[0.05em] text-center hover:text-red-500 transition-colors"
                    >
                      Limpar Filtros
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        {/* Table Header — desktop only */}
        <div className="hidden lg:grid grid-cols-[1.8fr_1.4fr_70px_100px_110px_90px] gap-[14px] px-[18px] pb-[10px] border-b border-border-main">
          {['CLIENTE', 'BARBEIRO', 'ITENS', 'TOTAL', 'PAGAMENTO', 'STATUS'].map((label, idx) => (
            <span
              key={label}
              className={cn(
                "text-[9px] font-medium text-[#2a2a2a] tracking-[0.1em] uppercase",
                idx === 2 && "text-center",
                idx === 3 && "text-right",
                idx === 4 && "text-center",
                idx === 5 && "text-right"
              )}
            >
              {label}
            </span>
          ))}
        </div>

        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px] px-[20px] bg-bg-sidebar border-[0.5px] border-dashed border-border-main rounded-[10px]">
            <Clock size={32} weight="regular" className="text-[#1e1e1e] mb-4" />
            <p className="text-[10px] font-medium text-[#222] tracking-[0.1em] uppercase">NENHUMA COMANDA PROCESSADA</p>
          </div>
        ) : (
          <ComandaHistoryTable items={filteredHistory} />
        )}
      </div>
    </div>
  )
}
