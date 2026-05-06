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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-accent uppercase tracking-[0.2em] mb-2">
            FINANCEIRO
          </p>
          <h1 className="text-3xl md:text-4xl font-bold font-syne text-white uppercase tracking-tight leading-none">
            Relatório de Comandas
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Monitore o desempenho financeiro e o ticket médio da barbearia.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Comandas Hoje"
          value={stats.today.toString()}
          icon={<Users className="w-5 h-5" />}
          subtitle="Finalizadas hoje"
        />
        <KPICard
          title="Em Aberto"
          value={stats.open.toString()}
          icon={<Clock className="w-5 h-5" />}
          subtitle="Aguardando fechamento"
        />
        <KPICard
          title="Receita Hoje"
          value={`R$ ${(stats.revenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<Wallet className="w-5 h-5" />}
          subtitle="Total processado"
        />
        <KPICard
          title="Ticket Médio"
          value={`R$ ${(stats.avgTicket / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="Por atendimento"
        />
      </div>

      {/* History Table Card */}
      <Card className="bg-[#141414] border-white/5 overflow-hidden">
        <CardHeader className="p-4 md:p-6 border-b border-white/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Period Selector */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
              {PERIODS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => changePeriod(id)}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200',
                    period === id
                      ? 'bg-accent text-black shadow-lg shadow-accent/20'
                      : 'text-muted-foreground hover:text-white'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex flex-1 md:max-w-xs gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente ou barbeiro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 h-9 text-sm"
                />
              </div>
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isPending ? (
            <div className="flex items-center justify-center h-48 gap-3 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          ) : (
            <ComandaHistoryTable items={filteredHistory} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
