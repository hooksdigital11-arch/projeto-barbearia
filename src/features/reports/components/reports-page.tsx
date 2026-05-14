'use client'

import dynamic from 'next/dynamic'
import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { FadersHorizontal, CircleNotch, CaretDown, FilePdf } from '@phosphor-icons/react'
import type { 
  RevenueReport, 
  AppointmentReport, 
  ClientReport, 
  TeamReport,
  LoyaltyReport,
  ReportPeriod 
} from '../types'
import Script from 'next/script'

const RevenueSection = dynamic(() => import('./revenue-section').then(m => m.RevenueSection), { ssr: false })
const AppointmentsSection = dynamic(() => import('./appointments-section').then(m => m.AppointmentsSection), { ssr: false })
const ClientsSection = dynamic(() => import('./clients-section').then(m => m.ClientsSection), { ssr: false })
const TeamSection = dynamic(() => import('./team-section').then(m => m.TeamSection), { ssr: false })
const LoyaltySection = dynamic(() => import('./loyalty-section').then(m => m.LoyaltySection), { ssr: false })

interface ReportsPageProps {
  initialRevenue: RevenueReport
  initialAppointments: AppointmentReport
  initialClients: ClientReport
  initialTeam: TeamReport
  initialLoyalty: LoyaltyReport
  organizationId: string
}

import { CustomDateModal } from './custom-date-modal'

export function ReportsPage({ 
  initialRevenue, 
  initialAppointments, 
  initialClients, 
  initialTeam,
  initialLoyalty,
  organizationId
}: ReportsPageProps) {
  const router = useRouter()
  const [dates, setDates] = useState({ 
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
    end: new Date().toISOString()
  })
  const [revenue, setRevenue] = useState(initialRevenue)
  const [appointments, setAppointments] = useState(initialAppointments)
  const [clients, setClients] = useState(initialClients)
  const [team, setTeam] = useState(initialTeam)
  const [loyalty, setLoyalty] = useState(initialLoyalty)
  const [activePeriod, setActivePeriod] = useState<ReportPeriod>('month')
  const [isPending, startTransition] = useTransition()
  const [showCustomModal, setShowCustomModal] = useState(false)

  // Sincroniza o estado local com as novas props do server pós-refresh
  useEffect(() => {
    setRevenue(initialRevenue)
    setAppointments(initialAppointments)
    setClients(initialClients)
    setTeam(initialTeam)
    setLoyalty(initialLoyalty)
  }, [initialRevenue, initialAppointments, initialClients, initialTeam, initialLoyalty])

  // Realtime setup
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('reports-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `organization_id=eq.${organizationId}` }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comanda_items', filter: `organization_id=eq.${organizationId}` }, () => router.refresh())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [organizationId, router])

  const handlePeriodChange = (period: ReportPeriod) => {
    startTransition(() => {
      setActivePeriod(period)
      const now = new Date()
      let start = new Date()
      
      if (period === 'today') start.setHours(0, 0, 0, 0)
      else if (period === 'week') start.setDate(now.getDate() - 7)
      else if (period === 'month') start.setMonth(now.getMonth() - 1)
      else if (period === 'year') start.setFullYear(now.getFullYear() - 1)
      
      const params = new URLSearchParams()
      params.set('start', start.toISOString())
      params.set('end', now.toISOString())
      params.set('period', period)
      
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }

  const handleCustomApply = (start: string, end: string) => {
    startTransition(() => {
      setActivePeriod('custom')
      const params = new URLSearchParams()
      params.set('start', new Date(start).toISOString())
      params.set('end', new Date(end).toISOString())
      params.set('period', 'custom')
      router.push(`?${params.toString()}`, { scroll: false })
      setShowCustomModal(false)
    })
  }

  const montarDados = () => {
    const periodLabels: Record<ReportPeriod, string> = {
      today: 'Hoje',
      week: 'Esta Semana',
      month: 'Este Mês',
      year: 'Este Ano',
      custom: 'Período Personalizado'
    }

    return {
      barbearia: {
        nome: 'Barbearia Admin', // TODO: conectar dado real
        barbeiro: 'Administrador' // TODO: conectar dado real
      },
      periodo: periodLabels[activePeriod] || 'Período',
      dataGeracao: new Date().toLocaleDateString('pt-BR'),

      // ── RECEITA ──────────────────────────────────────────────
      receita: {
        faturamentoTotal: revenue.kpis.totalRevenue,
        variacaoSemana: `${revenue.kpis.totalRevenueChange > 0 ? '+' : ''}${revenue.kpis.totalRevenueChange}%`,
        ticketMedio: revenue.kpis.averageTicket,
        totalAtendimentos: revenue.kpis.totalComandas,
        pagamentosPendentes: 0, // TODO: conectar dado real
        valorPresente: 0, // TODO: conectar dado real

        topServicos: revenue.topServices.map((s, i) => ({
          nome: s.name,
          categoria: 'Serviço', // TODO: conectar dado real
          faturamento: s.totalRevenue,
          participacao: revenue.kpis.totalRevenue ? `${((s.totalRevenue / revenue.kpis.totalRevenue) * 100).toFixed(1)}% do mix` : '0%',
          destaque: i === 0
        }))
      },

      // ── AGENDA ───────────────────────────────────────────────
      agenda: {
        total: appointments.kpis.total,
        confirmados: appointments.kpis.completed,
        cancelados: appointments.kpis.cancelled,
        noShow: appointments.kpis.noShow,
        taxaConclusao: appointments.kpis.completionRate,

        porDia: [
          { dia: 'Domingo', agendamentos: 0, concluidos: 0 },
          { dia: 'Segunda-feira', agendamentos: 0, concluidos: 0 },
          { dia: 'Terça-feira', agendamentos: 0, concluidos: 0 },
          { dia: 'Quarta-feira', agendamentos: 0, concluidos: 0 },
          { dia: 'Quinta-feira', agendamentos: 0, concluidos: 0 },
          { dia: 'Sexta-feira', agendamentos: 0, concluidos: 0 },
          { dia: 'Sábado', agendamentos: 0, concluidos: 0 }
        ].map(d => {
          const apiMatch = appointments.dayOfWeekDistribution.find(apiD => apiD.day.startsWith(d.dia.substring(0, 3)))
          return {
            dia: d.dia,
            agendamentos: apiMatch ? apiMatch.count : 0,
            concluidos: 0 // TODO: conectar dado real
          }
        })
      },

      // ── CLIENTES ─────────────────────────────────────────────
      clientes: {
        total: clients.kpis.totalActive,
        ativos: clients.kpis.totalActive,
        novos: clients.kpis.newClients,
        taxaRetencao: clients.kpis.retentionRate,
        satisfacao: 100, // TODO: conectar dado real

        lista: clients.topClients.map(c => ({
          nome: c.name,
          status: 'ATIVO' as const,
          faturamento: c.totalSpent,
          observacao: `Última visita: ${new Date(c.lastVisit).toLocaleDateString('pt-BR')}`
        }))
      },

      // ── EQUIPE ───────────────────────────────────────────────
      equipe: team.barbers.map(b => ({
        nome: b.name,
        avaliacao: b.rating,
        agendamentos: b.appointments,
        faturamento: b.revenue,
        status: 'ATIVO' as const
      })),

      // ── FIDELIDADE ───────────────────────────────────────────
      fidelidade: {
        inscritos: loyalty.kpis.activeMembers,
        pontosResgatados: loyalty.kpis.redemptions,
        presentesMes: loyalty.kpis.stampsDistributed,
        progressaoMedia: '0/10', // TODO: conectar dado real
        clientesBonificados: loyalty.kpis.activeMembers > 0 ? (loyalty.kpis.readyToRedeem / loyalty.kpis.activeMembers) * 100 : 0
      }
    }
  }

  return (
    <div className="relative min-h-screen pb-32 space-y-12">
      <Script 
        id="chart-js"
        src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js" 
        strategy="afterInteractive" 
      />
      
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-[30px] font-medium tracking-[-0.02em] text-text-primary">
            INSIGHTS<span className="text-accent-main">.</span>
          </h1>
          <p className="text-[11px] text-[#333] uppercase tracking-wide">
            Inteligência de dados para uma gestão de alto nível.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          {/* Pill Filters */}
          <div className="flex bg-bg-sidebar border border-border-main/50 rounded-full p-1 shrink-0">
            {(['today', 'week', 'month', 'year'] as ReportPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={cn(
                  "px-3 md:px-4 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-wider transition-all",
                  activePeriod === p
                    ? "bg-bg-surface text-accent-main border border-accent-main/10"
                    : "text-[#333] hover:text-[#666]"
                )}
              >
                {p === 'today' ? 'HOJE' : p === 'week' ? 'SEMANA' : p === 'month' ? 'MÊS' : 'ANO'}
              </button>
            ))}
          </div>

          <button 
            onClick={async () => {
              try {
                const { downloadInsightsPDF } = await import('@/lib/insights-pdf')
                await downloadInsightsPDF(montarDados())
              } catch (err) {
                console.error("Error generating PDF:", err)
              }
            }}
            className="flex items-center gap-2 bg-transparent border border-border-main text-text-primary px-5 py-2.5 rounded-[8px] text-[10px] font-semibold uppercase tracking-[0.1em] hover:bg-white/5 transition-all shrink-0"
          >
            <FilePdf size={15} weight="bold" />
            Exportar
          </button>

          <button 
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-2 bg-accent-main text-black px-5 py-2.5 rounded-[8px] text-[10px] font-semibold uppercase tracking-[0.1em] hover:opacity-90 transition-all shrink-0"
          >
            <FadersHorizontal size={15} weight="bold" />
            Personalizar
          </button>
        </div>
      </div>

      {showCustomModal && (
        <CustomDateModal 
          onApply={handleCustomApply}
          onClose={() => setShowCustomModal(false)}
        />
      )}

      {isPending ? (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <CircleNotch size={24} className="animate-spin text-[#333]" />
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#222]">Analisando Performance...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-24">
          {/* Revenue */}
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex align-items-center gap-2">
              <span className="text-[11px] font-medium tracking-[0.12em] text-[#383838] uppercase whitespace-nowrap">Receita</span>
              <div className="flex-1 h-[0.5px] bg-[#161616]" />
            </div>
            <RevenueSection data={revenue} />
          </div>

          {/* Agenda */}
          <div className="space-y-8 animate-in fade-in duration-700 delay-100">
            <div className="flex align-items-center gap-2">
              <span className="text-[11px] font-medium tracking-[0.12em] text-[#383838] uppercase whitespace-nowrap">Agenda</span>
              <div className="flex-1 h-[0.5px] bg-[#161616]" />
            </div>
            <AppointmentsSection data={appointments} />
          </div>

          {/* Clientes */}
          <div className="space-y-8 animate-in fade-in duration-700 delay-200">
            <div className="flex align-items-center gap-2">
              <span className="text-[11px] font-medium tracking-[0.12em] text-[#383838] uppercase whitespace-nowrap">Clientes</span>
              <div className="flex-1 h-[0.5px] bg-[#161616]" />
            </div>
            <ClientsSection data={clients} />
          </div>

          {/* Equipe */}
          <div className="space-y-8 animate-in fade-in duration-700 delay-300">
            <div className="flex align-items-center gap-2">
              <span className="text-[11px] font-medium tracking-[0.12em] text-[#383838] uppercase whitespace-nowrap">Equipe</span>
              <div className="flex-1 h-[0.5px] bg-[#161616]" />
            </div>
            <TeamSection data={team} />
          </div>

          {/* Fidelidade */}
          <div className="space-y-8 animate-in fade-in duration-700 delay-400">
            <div className="flex align-items-center gap-2">
              <span className="text-[11px] font-medium tracking-[0.12em] text-[#383838] uppercase whitespace-nowrap">Fidelidade</span>
              <div className="flex-1 h-[0.5px] bg-[#161616]" />
            </div>
            <LoyaltySection data={loyalty} />
          </div>
        </div>
      )}
    </div>
  )
}
