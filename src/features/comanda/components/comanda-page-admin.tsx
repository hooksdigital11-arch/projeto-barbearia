'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
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
import { Plus, Receipt, User, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ComandaActive } from './comanda-active'
import { getActiveComandaAction, getClientNameAction } from '../actions'
import { ComandaItem } from '../types'
import { cn } from '@/lib/utils/cn'

type Period = 'today' | 'week' | 'month'

interface AdminAppointment {
  id: string
  client_id: string
  client: { id: string; full_name: string | null; phone: string | null } | null
  service: { id: string; name: string | null; price_cents: number } | null
  barber: { id: string; full_name: string | null } | null
  start_time: string
  price_cents: number
  status: string
}

interface ClientOption {
  id: string
  full_name: string
  phone?: string | null
}

interface ComandaPageAdminProps {
  history: ComandaItemWithRelations[]
  stats: {
    today: number
    open: number
    revenue: number
    avgTicket: number
  }
  initialPeriod?: Period
  appointments: AdminAppointment[]
  clients: ClientOption[]
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
  appointments,
  clients,
}: ComandaPageAdminProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [period, setPeriod] = useState<Period>(initialPeriod)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBarber, setSelectedBarber] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isPending, startTransition] = useTransition()

  // Tabs: 'atendimento' (operational checkout) | 'historico' (financial log)
  const [activeTab, setActiveTab] = useState<'atendimento' | 'historico'>('atendimento')

  // Operational states
  const [selectedClient, setSelectedClient] = useState<{
    id: string
    name: string
    appointment: AdminAppointment | null
  } | null>(null)
  const [items, setItems] = useState<ComandaItem[]>([])
  const [loadingClientId, setLoadingClientId] = useState<string | null>(null)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [searchClientTerm, setSearchClientTerm] = useState('')

  const urlClientId = searchParams.get('clientId')
  const urlAppointmentId = searchParams.get('appointmentId')

  // Handle URL Redirection Parameters (from Finalizar button click)
  useEffect(() => {
    if (urlClientId) {
      setActiveTab('atendimento')
      
      const handleUrlClient = async () => {
        setLoadingClientId(urlClientId)
        try {
          let clientName = 'Desconhecido'
          const client = clients.find(c => c.id === urlClientId)
          if (client) {
            clientName = client.full_name
          } else {
            const res = await getClientNameAction(urlClientId)
            if (res.success && res.name) {
              clientName = res.name
            }
          }

          const appt = appointments.find(a => a.id === urlAppointmentId)

          const result = await getActiveComandaAction(urlClientId)
          if ('error' in result && result.error) {
            toast.error(result.error)
            return
          }
          const activeItems = result.data || []
          setItems(activeItems as ComandaItem[])
          setSelectedClient({
            id: urlClientId,
            name: clientName,
            appointment: appt || null
          })
        } catch (err) {
          console.error(err)
          toast.error('Erro ao carregar comanda')
        } finally {
          setLoadingClientId(null)
        }
      }
      
      handleUrlClient()
    }
  }, [urlClientId, urlAppointmentId, clients, appointments])

  const clearUrlParams = () => {
    router.replace(pathname)
  }

  const handleSelectClient = async (appt: AdminAppointment) => {
    setLoadingClientId(appt.client_id)
    try {
      const result = await getActiveComandaAction(appt.client_id)
      if ('error' in result && result.error) {
        toast.error(result.error)
        return
      }
      const activeItems = result.data || []
      setItems(activeItems as ComandaItem[])
      setSelectedClient({
        id: appt.client_id,
        name: appt.client?.full_name || 'Desconhecido',
        appointment: appt
      })
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar comanda')
    } finally {
      setLoadingClientId(null)
    }
  }

  const handleSelectClientOption = async (client: ClientOption) => {
    setLoadingClientId(client.id)
    try {
      const result = await getActiveComandaAction(client.id)
      if ('error' in result && result.error) {
        toast.error(result.error)
        return
      }
      const activeItems = result.data || []
      setItems(activeItems as ComandaItem[])
      setSelectedClient({
        id: client.id,
        name: client.full_name,
        appointment: null
      })
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar comanda')
    } finally {
      setLoadingClientId(null)
    }
  }

  const refreshItems = async () => {
    if (selectedClient) {
      const result = await getActiveComandaAction(selectedClient.id)
      if ('success' in result && result.success && result.data) {
        setItems(result.data as ComandaItem[])
      }
    }
  }

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

  // If a client's active checkout is open, render the active comanda component
  if (selectedClient) {
    return (
      <ComandaActive
        clientId={selectedClient.id}
        clientName={selectedClient.name}
        items={items}
        onRefresh={refreshItems}
        appointment={selectedClient.appointment ? {
          id: selectedClient.appointment.id,
          start_time: selectedClient.appointment.start_time,
          service: selectedClient.appointment.service?.name ? {
            name: selectedClient.appointment.service.name
          } : undefined
        } : null}
        onBack={() => {
          setSelectedClient(null)
          clearUrlParams()
        }}
      />
    )
  }

  return (
    <div className={cn('animate-premium-in py-8 space-y-8', isPending && 'opacity-60 pointer-events-none')}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-[32px] font-medium text-text-primary tracking-[-0.02em] uppercase">
          COMANDAS<span className="text-accent-main">.</span>
        </h1>
        <p className="text-[11px] text-[#333] leading-[1.5] max-w-[420px] font-medium uppercase tracking-wide">
          Gestão financeira de atendimentos. Monitore faturamento, ticket médio e fluxo de fechamento de contas com precisão absoluta.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[3px] w-fit">
        <button
          onClick={() => setActiveTab('atendimento')}
          className={cn(
            'px-6 py-2 rounded-[6px] text-[10px] font-medium uppercase tracking-[0.05em] transition-all duration-300',
            activeTab === 'atendimento'
              ? 'bg-[#1c1c1c] text-text-secondary'
              : 'text-[#333] hover:text-text-nav'
          )}
        >
          Atendimento
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={cn(
            'px-6 py-2 rounded-[6px] text-[10px] font-medium uppercase tracking-[0.05em] transition-all duration-300',
            activeTab === 'historico'
              ? 'bg-[#1c1c1c] text-text-secondary'
              : 'text-[#333] hover:text-text-nav'
          )}
        >
          Histórico Financeiro
        </button>
      </div>

      {/* Operational checkout view */}
      {activeTab === 'atendimento' && (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.14em] mb-[6px]">GESTÃO OPERACIONAL</p>
              <h2 className="text-[20px] font-medium text-[#fff] tracking-[-0.01em] uppercase leading-none">
                Faturamento e Vendas
              </h2>
              <p className="text-[11px] text-[#333] mt-2 font-medium uppercase tracking-wider">
                Selecione um agendamento do dia para abrir a comanda ou realize uma venda avulsa.
              </p>
            </div>
            
            <button 
              className="bg-accent-main text-black text-[10px] font-medium tracking-[0.1em] p-[10px_18px] rounded-[8px] flex items-center gap-2 hover:brightness-110 transition-all uppercase shrink-0 cursor-pointer"
              onClick={() => setIsClientModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Venda Avulsa
            </button>
          </div>

          {/* Grid of today's appointments for checkout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {appointments.map((appt) => (
              <div 
                key={appt.id} 
                className="group relative flex flex-col justify-between p-5 rounded-[10px] border border-[#1a1a1a] bg-[#0f0f0f] hover:bg-[#111] hover:border-[#222] transition-all cursor-pointer overflow-hidden"
                onClick={() => handleSelectClient(appt)}
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="w-9 h-9 rounded-[8px] bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <User size={16} className="text-accent-main opacity-60" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-accent-main group-hover:text-black transition-all duration-300">
                    <Receipt size={14} />
                  </div>
                </div>

                <div className="space-y-1 mb-5">
                  <h3 className="text-[14px] font-bold text-text-primary tracking-tight group-hover:text-accent-main transition-colors truncate">
                    {appt.client?.full_name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={12} className="text-accent-main" />
                      <span className="text-[9px] font-medium uppercase tracking-wider">
                        {new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-[9px] text-[#444] font-medium uppercase tracking-wider truncate">
                      Barbeiro: {appt.barber?.full_name}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Serviço</p>
                    <p className="text-xs font-bold text-text-primary truncate max-w-[120px]">
                      {appt.service?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Valor</p>
                    <p className="text-sm font-bold text-accent-main font-mono">
                      R$ {(appt.price_cents / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                {loadingClientId === appt.client_id && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-20">
                    <div className="w-6 h-6 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {appointments.length === 0 && (
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] min-h-[300px] flex flex-col items-center justify-center p-8 gap-4">
              <Receipt className="w-8 h-8 text-[#1e1e1e]" />
              <div className="text-center space-y-1">
                <p className="text-[14px] font-medium text-[#333] uppercase tracking-wider">Nenhum atendimento agendado para hoje</p>
                <p className="text-[11px] text-[#222] uppercase tracking-widest">Os agendamentos ativos aparecerão aqui para abertura de comanda.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Financial KPIs and Logs history view */}
      {activeTab === 'historico' && (
        <div className="space-y-12 animate-in fade-in duration-700">
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
      )}

      {/* Modal for selecting client (Venda Avulsa) */}
      <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
        <DialogContent className="bg-bg-surface border-white/10 max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-syne uppercase tracking-tight text-text-primary text-[18px]">
              Selecionar Cliente
            </DialogTitle>
          </DialogHeader>
          <div className="relative group bg-[#111] border border-white/5 rounded-[8px] flex items-center px-[14px] mt-4 mb-4">
            <Search size={14} className="text-[#555] shrink-0" />
            <input
              type="text"
              placeholder="BUSCAR CLIENTE PELO NOME..."
              value={searchClientTerm}
              onChange={(e) => setSearchClientTerm(e.target.value)}
              className="bg-transparent border-none outline-none py-[10px] pl-[10px] text-[11px] text-text-secondary placeholder:text-[#444] w-full font-medium"
            />
          </div>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {clients
              .filter(client => 
                client.full_name.toLowerCase().includes(searchClientTerm.toLowerCase())
              )
              .map(client => (
                <div
                  key={client.id}
                  className="flex justify-between items-center p-3.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                  onClick={() => {
                    setIsClientModalOpen(false)
                    setSearchClientTerm('')
                    handleSelectClientOption(client)
                  }}
                >
                  <div>
                    <p className="font-bold text-text-primary uppercase text-[12px] tracking-wide">
                      {client.full_name}
                    </p>
                    {client.phone && (
                      <p className="text-[10px] text-muted-foreground">{client.phone}</p>
                    )}
                  </div>
                  <span className="text-[9px] font-semibold text-accent-main uppercase tracking-wider group-hover:underline">
                    Selecionar
                  </span>
                </div>
              ))}
            {clients.filter(client => 
              client.full_name.toLowerCase().includes(searchClientTerm.toLowerCase())
            ).length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-xs uppercase tracking-wider">
                Nenhum cliente encontrado
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
