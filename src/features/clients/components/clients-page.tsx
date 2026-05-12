'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect, useDeferredValue } from 'react'
import {
  Users,
  UserCheck,
  UserPlus,
  Cake,
  Gift,
  Plus,
  FunnelSimple,
  MagnifyingGlass,
  Faders,
  List,
  Cards,
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
    <div className="space-y-12 py-8 animate-premium-in">
      {/* Minimalist Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-[32px] font-medium font-syne text-text-primary tracking-[-0.02em] uppercase leading-none">
            Clientes<span className="text-accent-main">.</span>
          </h1>
          <p className="text-[11px] text-[#333] font-medium uppercase tracking-wider">Gestão completa da sua base de clientes</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Pill-tabs View Toggle */}
          <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] p-[3px] flex items-center">
            {[
              { id: 'table', label: 'TABELA', icon: List },
              { id: 'cards', label: 'CARDS', icon: Cards }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleViewChange(tab.id as 'cards' | 'table')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-[5px] text-[10px] font-medium tracking-[0.07em] transition-all",
                  view === tab.id ? "bg-[#1c1c1c] text-text-secondary" : "text-[#444] hover:text-[#666]"
                )}
              >
                <tab.icon size={12} weight="regular" />
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-accent-main text-black px-5 py-2.5 rounded-[7px] transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <Plus size={14} weight="regular" />
              <span className="tracking-[0.1em] text-[10px] font-medium uppercase">Novo Registro</span>
            </div>
          </button>
        </div>
      </div>

      {/* KPI Section - Minimalist Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[10px]">
        {[
          { label: 'TOTAL', value: stats.total, icon: Users, desc: 'BASE TOTAL CADASTRADA' },
          { label: 'ATIVOS', value: stats.active, icon: UserCheck, desc: 'ATENDIDOS ÚLTIMOS 60 DIAS' },
          { label: 'NOVOS', value: stats.newThisMonth, icon: UserPlus, desc: 'CADASTROS ESTE MÊS' },
          { label: 'ANIVERSÁRIOS', value: stats.birthdaysThisWeek, icon: Gift, desc: 'ANIVERSARIANTES DA SEMANA' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px] px-[18px] flex flex-col justify-between h-[110px]">
            <div className="flex items-start gap-2">
              <p className="text-[10px] tracking-[0.1em] text-[#444] font-medium uppercase shrink-0">{kpi.label}</p>
              <kpi.icon size={14} weight="regular" className="text-accent-main opacity-40 ml-auto" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[28px] font-medium text-text-primary tracking-tight leading-none">
                {kpi.value}
              </p>
              <p className="text-[8px] text-[#2a2a2a] font-medium uppercase tracking-[0.07em]">
                {kpi.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 group">
          <div className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#2e2e2e]">
            <MagnifyingGlass size={16} weight="regular" />
          </div>
          <input
            type="text"
            placeholder="BUSCAR POR NOME, TELEFONE OU EMAIL..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] py-[10px] pl-[42px] pr-[14px] text-[12px] text-text-muted font-medium outline-none transition-all focus:border-accent-main/20 placeholder:text-[#2e2e2e] uppercase tracking-wide"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-5 py-[10px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all",
            showFilters ? "text-accent-main border-accent-main/30" : "text-[#444] hover:text-[#666]"
          )}
        >
          <Faders size={16} weight="regular" />
          FILTROS
        </button>
      </div>

      {/* Filter Pills */}
      {showFilters ? (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
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
                "px-5 py-2 rounded-[6px] text-[10px] font-medium uppercase tracking-[0.08em] transition-all",
                statusFilter === option.value
                  ? "bg-[#1e1e1e] text-text-primary"
                  : "text-[#444] hover:text-[#666]"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative">
        <div className="relative">
          {filtered.length === 0 ? (
            <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[12px] p-24 text-center flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-bg-surface border-[0.5px] border-border-main flex items-center justify-center text-[#2e2e2e]">
                <Users size={32} weight="thin" />
              </div>
              <div className="space-y-1">
                <p className="text-[16px] font-medium text-text-primary uppercase tracking-tight">Nenhum cliente encontrado</p>
                <p className="text-[11px] text-[#333] uppercase tracking-wider">Ajuste os filtros ou realize um novo cadastro</p>
              </div>
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

      {/* Results count footer */}
      {filtered.length > 0 ? (
        <div className="flex items-center justify-center py-4">
          <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#222]">
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
