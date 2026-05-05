'use client'

import { useState, useCallback, useEffect } from 'react'
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
import { EmptyState } from '@/components/shared/empty-state'
import { SearchInput } from '@/components/shared/search-input'
import { ViewToggle } from './view-toggle'
import { ClientCard } from './client-card'
import { ClientsTable } from './clients-table'
import { CreateClientModal } from './create-client-modal'
import type { ClientRecord, ClientsStats, BarberOption, ClientStatus } from '../types'

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

  // Client-side filtering for instant feedback
  const filtered = clients.filter(c => {
    // Search filter
    if (search) {
      const q = search.toLowerCase()
      const matchesName = c.full_name?.toLowerCase().includes(q)
      const matchesPhone = c.phone?.toLowerCase().includes(q)
      const matchesEmail = c.email?.toLowerCase().includes(q)
      if (!matchesName && !matchesPhone && !matchesEmail) return false
    }
    // Status filter
    if (statusFilter && c.status !== statusFilter) return false
    return true
  })

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <PageTitle
          title="Clientes"
          subtitle={`${stats.total} clientes cadastrados`}
          className="mb-0"
        />
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={handleViewChange} />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-accent-cyan text-black font-bold text-sm hover:bg-accent-cyan/90 transition-all shadow-lg shadow-accent-cyan/20"
          >
            <Plus size={18} weight="bold" />
            Novo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="Total"
          value={stats.total}
          icon={<Users size={20} weight="duotone" />}
        />
        <KPICard
          title="Ativos"
          value={stats.active}
          subtitle="últimos 60 dias"
          icon={<UserCheck size={20} weight="duotone" />}
        />
        <KPICard
          title="Novos"
          value={stats.newThisMonth}
          subtitle="este mês"
          icon={<UserPlus size={20} weight="duotone" />}
        />
        <KPICard
          title="Aniversariantes"
          value={stats.birthdaysThisWeek}
          subtitle="esta semana"
          icon={<Cake size={20} weight="duotone" />}
        />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          onSearch={handleSearch}
          placeholder="Buscar nome, telefone, email..."
          className="max-w-none sm:max-w-sm flex-1"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
            showFilters || statusFilter
              ? 'border-accent-cyan/30 bg-accent-cyan/5 text-accent-cyan'
              : 'border-white/10 bg-white/5 text-text-secondary hover:text-white'
          }`}
        >
          <FunnelSimple size={16} weight="bold" />
          Filtros
          {statusFilter && (
            <span className="w-2 h-2 rounded-full bg-accent-cyan" />
          )}
        </button>
      </div>

      {/* Filter Pills */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
          {[
            { value: '', label: 'Todos' },
            { value: 'active', label: 'Ativos' },
            { value: 'blocked', label: 'Bloqueados' },
            { value: 'inactive', label: 'Inativos' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value as ClientStatus | '')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === option.value
                  ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30'
                  : 'bg-white/5 text-text-secondary border border-white/10 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState
          title={search ? 'Nenhum resultado' : 'Nenhum cliente'}
          description={
            search
              ? `Nenhum cliente encontrado para "${search}"`
              : 'Cadastre o primeiro cliente para começar.'
          }
          icon={<Users size={48} weight="duotone" />}
          action={
            !search && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors text-sm font-medium"
              >
                + Cadastrar cliente
              </button>
            )
          }
        />
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Results count */}
      {filtered.length > 0 && (
        <p className="text-xs text-text-secondary mt-4 text-center">
          {filtered.length} {filtered.length === 1 ? 'cliente' : 'clientes'}
          {search && ` para "${search}"`}
        </p>
      )}

      {/* Create Modal */}
      <CreateClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        barbers={barbers}
      />
    </>
  )
}
