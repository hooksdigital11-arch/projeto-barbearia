'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect, useDeferredValue } from 'react'
import {
  Users,
  UserCheck,
  UserPlus,
  Cake,
  Plus,
  FunnelSimple,
} from '@phosphor-icons/react'
import { KPICard } from '@/components/shared/kpi-card'
import { PageTitle } from '@/components/shared/page-title'
import { SearchInput } from '@/components/shared/search-input'
import { ViewToggle } from './view-toggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { ClientRecord, ClientsStats, BarberOption, ClientStatus } from '../types'

const CreateClientModal = dynamic(() => import('./create-client-modal').then(m => m.CreateClientModal), { ssr: false })
const ClientsTable = dynamic(() => import('./clients-table').then(m => m.ClientsTable), { ssr: false })
const ClientCard = dynamic(() => import('./client-card').then(m => m.ClientCard), { ssr: false })

interface ClientsPageProps {
  clients: ClientRecord[]
  stats: ClientsStats
  barbers: BarberOption[]
  role: 'admin' | 'barber'
  basePath: string
}

export function ClientsPage({
  clients,
  stats,
  barbers,
  role,
  basePath,
}: ClientsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [view, setView] = useState<'cards' | 'table'>('table')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClientStatus | ''>('')
  const [showFilters, setShowFilters] = useState(false)

  const showFinancials = role === 'admin'

  // Restore view preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('clients-view')
    if (saved === 'cards' || saved === 'table') setView(saved)
  }, [])

  function handleViewChange(v: 'cards' | 'table') {
    setView(v)
    localStorage.setItem('clients-view', v)
  }

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
  }, [])

  const deferredSearch = useDeferredValue(search)

  // Client-side filtering for instant feedback
  const filtered = clients.filter(c => {
    if (deferredSearch) {
      const q = deferredSearch.toLowerCase()
      const matchesName = c.full_name?.toLowerCase().includes(q)
      const matchesPhone = c.phone?.toLowerCase().includes(q)
      const matchesEmail = c.email?.toLowerCase().includes(q)
      if (!matchesName && !matchesPhone && !matchesEmail) return false
    }
    if (statusFilter && c.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-16 animate-premium-in">
      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        <PageTitle 
          title="Clientes" 
          subtitle="Gestão completa da sua base de clientes. Acompanhe o comportamento, fidelidade e histórico de atendimentos com inteligência." 
          className="mb-0" 
        />

        <div className="flex items-center gap-4 ml-7 lg:ml-0">
          <ViewToggle view={view} onViewChange={handleViewChange} />
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="cyan"
            size="lg"
            className="gap-4 px-10 py-8 rounded-3xl font-black text-xs uppercase tracking-[0.2em] bg-white text-black hover:bg-accent-cyan transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-accent-cyan/20 active:scale-95 group"
          >
            <Plus size={22} weight="bold" className="group-hover:rotate-90 transition-transform duration-500" />
            Novo Registro
          </Button>
        </div>
      </div>

      {/* KPI Section - Precision Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 overflow-hidden">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: '#8b5cf6', desc: 'Base total cadastrada' },
          { label: 'Ativos', value: stats.active, icon: UserCheck, color: '#3b82f6', desc: 'Atendidos nos últimos 60 dias' },
          { label: 'Novos', value: stats.newThisMonth, icon: UserPlus, color: '#10b981', desc: 'Cadastros realizados este mês' },
          { label: 'Aniversários', value: stats.birthdaysThisWeek, icon: Cake, color: '#ec4899', desc: 'Aniversariantes da semana' }
        ].map((kpi, idx) => (
          <div key={idx} className="p-10 bg-black flex flex-col justify-between h-48 group">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
                {kpi.label}
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

      {/* Search + Filters */}
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="relative flex-1 group/search">
          <SearchInput
            onSearch={handleSearch}
            placeholder="Buscar por nome, telefone ou email..."
            className="max-w-none flex-1 glass-input h-14 pl-12"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "tap-target glass rounded-2xl border text-xs font-black uppercase tracking-widest transition-all px-6 gap-3",
              showFilters || statusFilter
                ? 'border-accent-cyan/30 bg-accent-cyan/5 text-accent-cyan'
                : 'border-white/5 bg-white/5 text-text-secondary hover:text-white'
            )}
          >
            <FunnelSimple size={18} weight="bold" />
            Filtros
            {statusFilter && (
              <div className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
            )}
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      {showFilters ? (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {[
            { value: '', label: 'Todos' },
            { value: 'active', label: 'Ativos' },
            { value: 'blocked', label: 'Bloqueados' },
            { value: 'inactive', label: 'Inativos' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value as ClientStatus | '')}
              className={cn(
                "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                statusFilter === option.value
                  ? "bg-white text-black shadow-lg"
                  : "bg-white/5 text-text-secondary border border-white/5 hover:text-white hover:bg-white/10"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      {/* Content */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent-cyan/10 to-accent-blue/10 rounded-[2.5rem] blur-xl opacity-50" />
        <div className="relative">
          {filtered.length === 0 ? (
            <div className="glass-card p-32 text-center flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center text-text-secondary opacity-20">
                <Users size={48} weight="thin" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold font-syne text-white uppercase tracking-tight">Nenhum cliente encontrado</p>
                <p className="text-text-secondary max-w-xs mx-auto">Tente ajustar seus filtros ou realize um novo cadastro.</p>
              </div>
              {!search && (
                <Button onClick={() => setIsModalOpen(true)} variant="outline" size="sm">
                  + Cadastrar cliente
                </Button>
              )}
            </div>
          ) : view === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(client => (
                <ClientCard
                  key={client.id}
                  client={client}
                  basePath={basePath}
                  showFinancials={showFinancials}
                />
              ))}
            </div>
          ) : (
            <ClientsTable
              clients={filtered}
              basePath={basePath}
              showFinancials={showFinancials}
            />
          )}
        </div>
      </div>

      {/* Results count */}
      {filtered.length > 0 ? (
        <div className="flex items-center justify-center py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary opacity-40">
            {filtered.length} {filtered.length === 1 ? 'cliente exibido' : 'clientes exibidos'}
            {search && ` para "${search}"`}
          </p>
        </div>
      ) : null}

      {/* Create Modal */}
      <CreateClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        barbers={barbers}
      />
    </div>
  )
}
