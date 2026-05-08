'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ComandaHistoryTable } from './comanda-history-table'
import { ComandaItemWithRelations } from '../types'
import {
  MagnifyingGlass,
  TrendUp,
  Users,
  Wallet,
  Clock,
  SlidersHorizontal,
} from '@phosphor-icons/react'
import { PageTitle } from '@/components/shared/page-title'
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
  const [isPending, startTransition] = useTransition()

  const changePeriod = (newPeriod: Period) => {
    setPeriod(newPeriod)
    startTransition(() => {
      router.push(`${pathname}?period=${newPeriod}`)
    })
  }

  const filteredHistory = history.filter(
    (item) =>
      item.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barber?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div
      className={cn(
        'space-y-16 animate-premium-in',
        isPending && 'opacity-60 pointer-events-none'
      )}
    >
      {/* Editorial Header */}
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-12 bg-accent-cyan rounded-full shadow-[0_0_30px_rgba(0,229,255,0.4)]" />
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-syne text-white tracking-tighter leading-none uppercase">
              Comandas<span className="text-accent-cyan">.</span>
            </h1>
          </div>
          <p className="text-text-secondary text-lg font-medium max-w-xl ml-7 border-l border-white/10 pl-6 leading-relaxed">
            Gestão financeira de atendimentos. Monitore faturamento, ticket médio e fluxo de fechamento de contas com precisão absoluta.
          </p>
        </div>
      </div>

      {/* KPI Section - Precision Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 overflow-hidden">
        {[
          { title: 'Comandas Hoje', value: stats.today, icon: Users, color: '#8b5cf6', desc: 'Finalizadas hoje' },
          { title: 'Em Aberto', value: stats.open, icon: Clock, color: '#ef4444', desc: 'Aguardando fechamento' },
          { title: 'Receita Hoje', value: `R$ ${(stats.revenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, icon: Wallet, color: '#10b981', desc: 'Total processado' },
          { title: 'Ticket Médio', value: `R$ ${(stats.avgTicket / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, icon: TrendUp, color: '#00e5ff', desc: 'Média por atendimento' }
        ].map((kpi, idx) => (
          <div key={idx} className="p-10 bg-black flex flex-col justify-between h-48 group">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
                {kpi.title}
              </p>
              <kpi.icon size={20} weight="bold" style={{ color: kpi.color }} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-5xl font-bold font-mono text-white tracking-tighter group-hover:text-accent-cyan transition-colors">
                {kpi.value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest opacity-30 group-hover:opacity-60 transition-opacity">
                {kpi.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section - High Precision */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent-cyan/10 to-accent-blue/10 rounded-[2.5rem] blur-xl opacity-50 transition-opacity" />
        <div className="relative glass-card overflow-hidden">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
            {/* Period Selector Pills */}
            <div className="flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
              {PERIODS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => changePeriod(id)}
                  className={cn(
                    'px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500',
                    period === id
                      ? 'bg-white text-black shadow-2xl scale-105'
                      : 'text-muted-foreground hover:text-white'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search + Filter */}
            <div className="flex flex-1 md:max-w-md gap-4">
              <div className="relative flex-1 group/search">
                <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/search:text-accent-cyan transition-colors" />
                <Input
                  placeholder="Buscar cliente ou barbeiro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 glass-input h-14 text-sm font-medium border-white/10"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 shrink-0 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 active:scale-90 transition-all group"
              >
                <SlidersHorizontal size={20} weight="bold" className="group-hover:text-accent-cyan transition-colors" />
              </Button>
            </div>
          </div>

          <div className="p-0 min-h-[400px]">
            {isPending ? (
              <div className="flex items-center justify-center h-96 gap-4">
                <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-black uppercase tracking-[0.4em] text-accent-cyan animate-pulse">Sincronizando...</span>
              </div>
            ) : (
              <ComandaHistoryTable items={filteredHistory} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
