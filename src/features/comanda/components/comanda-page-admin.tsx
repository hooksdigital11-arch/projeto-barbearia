'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { KPICard } from '@/components/shared/kpi-card'
import { ComandaHistoryTable } from './comanda-history-table'
import { ComandaItemWithRelations } from '../types'
import {
  Search,
  TrendingUp,
  Users,
  Wallet,
  Clock,
  SlidersHorizontal,
} from 'lucide-react'
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
        'space-y-8 transition-opacity duration-300',
        isPending && 'opacity-60 pointer-events-none'
      )}
    >
      {/* Header com Design Assimétrico */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16 animate-in fade-in duration-1000">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-12 bg-accent-cyan rounded-full shadow-[0_0_30px_rgba(0,229,255,0.4)]" />
            <h1 className="text-5xl md:text-7xl font-black font-syne text-white tracking-tighter leading-none uppercase">
              Comandas<span className="text-accent-cyan">.</span>
            </h1>
          </div>
          <p className="text-text-secondary text-lg font-medium max-w-xl ml-7 border-l border-white/10 pl-6">
            Gestão financeira de atendimentos. Monitore faturamento, ticket médio e fluxo de fechamento de contas com precisão absoluta.
          </p>
        </div>
      </div>

      {/* KPI Cards com Design Pro Max */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          { title: 'Comandas Hoje', value: stats.today, icon: Users, color: '#8b5cf6', desc: 'Finalizadas hoje' },
          { title: 'Em Aberto', value: stats.open, icon: Clock, color: '#ef4444', desc: 'Aguardando fechamento' },
          { title: 'Receita Hoje', value: `R$ ${(stats.revenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, icon: Wallet, color: '#10b981', desc: 'Total processado' },
          { title: 'Ticket Médio', value: `R$ ${(stats.avgTicket / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, icon: TrendingUp, color: '#00e5ff', desc: 'Média por atendimento' }
        ].map((kpi, idx) => (
          <div key={idx} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-white/[0.03] border border-white/10 group-hover:scale-110 transition-transform">
                <kpi.icon size={24} className="opacity-80" style={{ color: kpi.color }} />
              </div>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{kpi.title}</h4>
              <p className="text-4xl font-bold text-white tabular-nums tracking-tighter">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest opacity-50">{kpi.desc}</p>
            </div>
            <div className="absolute -bottom-2 -right-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <kpi.icon size={80} />
            </div>
          </div>
        ))}
      </div>

      {/* History Table Card com Design Refinado */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent-cyan/10 to-accent-blue/10 rounded-[2.5rem] blur-xl opacity-50 transition-opacity" />
        <div className="relative glass-card overflow-hidden">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
            {/* Period Selector */}
            <div className="flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
              {PERIODS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => changePeriod(id)}
                  className={cn(
                    'px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500',
                    period === id
                      ? 'bg-white text-black shadow-2xl'
                      : 'text-muted-foreground hover:text-white'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex flex-1 md:max-w-md gap-4">
              <div className="relative flex-1 group/search">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/search:text-accent-cyan transition-colors" />
                <Input
                  placeholder="Buscar cliente ou barbeiro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 glass-input h-14 text-sm font-medium"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 shrink-0 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 active:scale-90 transition-all"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-0 min-h-[400px]">
            {isPending ? (
              <div className="flex items-center justify-center h-96 gap-3 text-muted-foreground">
                <div className="w-5 h-5 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Carregando Relatório...</span>
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
